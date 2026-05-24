import logging
import asyncio
from datetime import datetime, timedelta
import random
from typing import Dict, List, Optional, Any
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure

from app.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Database")

class MockDatabase:
    """
    High-fidelity in-memory database that mirrors MongoDB collections.
    Pre-seeds realistic records for instant demo capability.
    """
    def __init__(self):
        self.users: Dict[str, Dict[str, Any]] = {}
        self.transactions: List[Dict[str, Any]] = []
        self._seed_mock_data()
        logger.info("Mock in-memory database successfully initialized and pre-seeded.")

    def _seed_mock_data(self):
        # 1. Seed demo user (for guest quick-login or testing)
        # Note: passwords are pre-hashed for convenience of mock testing
        # password is 'guest123'
        self.users["guest_demo"] = {
            "_id": "guest_demo",
            "email": "guest@fraudshield.ai",
            "password_hash": "$2b$12$/hOocURVBhek0tMZAM3Y4eoQDfjdIx9PQHvO8KS4OAHvd4k/S4Lay",
            "full_name": "Guest User",
            "created_at": datetime.utcnow()
        }

        # 2. Seed 100 highly realistic historical transactions over the last 30 days
        np_locations = ['US', 'EU', 'IN', 'ASIA', 'OTHER']
        np_devices = ['Mobile', 'Desktop', 'Tablet']
        np_payments = ['Credit Card', 'Debit Card', 'PayPal', 'Transfer']
        
        start_date = datetime.utcnow() - timedelta(days=30)
        
        for i in range(120):
            tx_id = f"TXN{100000 + i}"
            # Random date distributed over the last 30 days
            days_ago = random.uniform(0, 30)
            tx_time = start_date + timedelta(days=days_ago)
            
            # Base variables
            amount = round(random.expovariate(1 / 250.0) + 5.0, 2)
            if random.random() < 0.06: # 6% chance of a high outlier
                amount = round(random.uniform(3000.0, 12000.0), 2)
                
            location = random.choices(np_locations, weights=[0.4, 0.25, 0.2, 0.1, 0.05])[0]
            device = random.choices(np_devices, weights=[0.55, 0.35, 0.1])[0]
            hour = tx_time.hour
            payment = random.choices(np_payments, weights=[0.45, 0.3, 0.15, 0.1])[0]
            
            # Determine fraud rules identical to ML training distribution for consistency
            prob = 0.005
            if amount > 10000:
                prob += 0.35
            elif amount > 5000:
                prob += 0.15
            elif amount > 1000:
                prob += 0.05
                
            if hour in [23, 0, 1, 2, 3, 4]:
                prob += 0.08
                
            if payment == 'Transfer' and amount > 2000:
                prob += 0.20
                
            if device == 'Mobile' and location in ['ASIA', 'OTHER']:
                prob += 0.10
                
            if payment == 'Debit Card':
                prob -= 0.02
            elif payment == 'Transfer':
                prob += 0.05
                
            prob = min(max(prob, 0.001), 0.95)
            
            # Simulated model prediction
            is_fraud = 1 if (random.random() < prob) else 0
            
            # Map risk levels
            if prob > 0.6 or is_fraud == 1:
                risk_level = "high"
                status = "Flagged"
            elif prob > 0.25:
                risk_level = "medium"
                status = "Investigating"
            else:
                risk_level = "low"
                status = "Safe"
                
            self.transactions.append({
                "_id": tx_id,
                "user_id": "guest_demo",
                "amount": amount,
                "location": location,
                "device_type": device,
                "transaction_hour": hour,
                "transaction_date": tx_time.isoformat(),
                "payment_method": payment,
                "is_fraud": is_fraud,
                "probability": round(prob * 100, 2),
                "risk_level": risk_level,
                "status": status
            })
            
        # Sort transaction array by date descending (latest first)
        self.transactions.sort(key=lambda x: x["transaction_date"], reverse=True)


class DatabaseManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Any = None
        self.is_mock = True
        self.mock_db = MockDatabase()
        
    async def connect(self):
        """
        Attempts to connect to MongoDB Atlas if URI exists.
        Gracefully falls back to mock in-memory DB if there's any connectivity block or missing variables.
        """
        if not settings.MONGODB_URI:
            logger.warning("No MONGODB_URI set in environment variables. Falling back to High-Fidelity Mock Database.")
            self.is_mock = True
            return
            
        try:
            # Set a 3-second connection timeout to avoid hanging the backend
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI, 
                serverSelectionTimeoutMS=3000
            )
            # Trigger a ping check
            await self.client.admin.command('ping')
            self.db = self.client.get_database("fraudshield")
            self.is_mock = False
            logger.info("Successfully connected to live MongoDB Atlas Instance!")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB Atlas: {str(e)}")
            logger.warning("Falling back to High-Fidelity Mock Database.")
            self.is_mock = True

    # User helper routines
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        if self.is_mock:
            for user in self.mock_db.users.values():
                if user["email"].lower() == email.lower():
                    return user
            return None
        else:
            return await self.db.users.find_one({"email": email})

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.is_mock:
            return self.mock_db.users.get(user_id)
        else:
            return await self.db.users.find_one({"_id": user_id})

    async def create_user(self, user_data: Dict[str, Any]) -> str:
        if self.is_mock:
            user_id = user_data["_id"]
            self.mock_db.users[user_id] = user_data
            return user_id
        else:
            await self.db.users.insert_one(user_data)
            return user_data["_id"]

    # Transaction helper routines
    async def get_transactions(self, user_id: str, search: Optional[str] = None, 
                               risk: Optional[str] = None, payment: Optional[str] = None,
                               skip: int = 0, limit: int = 50) -> Dict[str, Any]:
        """
        Fetches sorted transactions with optional query filters, search text, and pagination.
        """
        if self.is_mock:
            filtered_tx = [t for t in self.mock_db.transactions if t["user_id"] == user_id]
            
            # Apply search text
            if search:
                s_lower = search.lower()
                filtered_tx = [t for t in filtered_tx if s_lower in t["_id"].lower() or s_lower in t["location"].lower() or s_lower in str(t["amount"])]
                
            # Apply risk filter
            if risk and risk != "All":
                filtered_tx = [t for t in filtered_tx if t["risk_level"].lower() == risk.lower()]
                
            # Apply payment filter
            if payment and payment != "All":
                filtered_tx = [t for t in filtered_tx if t["payment_method"].lower() == payment.lower()]
                
            total_count = len(filtered_tx)
            paginated_tx = filtered_tx[skip: skip + limit]
            
            return {
                "transactions": paginated_tx,
                "total": total_count,
                "skip": skip,
                "limit": limit
            }
        else:
            # Live MongoDB Atlas Query
            query = {"user_id": user_id}
            
            if search:
                query["$or"] = [
                    {"_id": {"$regex": search, "$options": "i"}},
                    {"location": {"$regex": search, "$options": "i"}},
                    {"status": {"$regex": search, "$options": "i"}}
                ]
                
            if risk and risk != "All":
                query["risk_level"] = risk.lower()
                
            if payment and payment != "All":
                query["payment_method"] = payment
                
            cursor = self.db.transactions.find(query).sort("transaction_date", -1)
            total_count = await self.db.transactions.count_documents(query)
            
            # Apply pagination
            cursor = cursor.skip(skip).limit(limit)
            tx_list = await cursor.to_list(length=limit)
            
            # MongoDB objects serialization helper
            for tx in tx_list:
                tx["_id"] = str(tx["_id"])
                
            return {
                "transactions": tx_list,
                "total": total_count,
                "skip": skip,
                "limit": limit
            }

    async def add_transaction(self, tx_data: Dict[str, Any]) -> str:
        """
        Inserts a new transaction prediction record. 
        In mock/guest mode, saves to RAM so users can interactively insert test cases and explore.
        """
        if self.is_mock:
            tx_id = f"TXN{100000 + len(self.mock_db.transactions) + random.randint(1, 99)}"
            tx_data["_id"] = tx_id
            # Insert at the beginning so it shows in "recent activity feed"
            self.mock_db.transactions.insert(0, tx_data)
            return tx_id
        else:
            res = await self.db.transactions.insert_one(tx_data)
            return str(res.inserted_id)

    async def get_analytics(self, user_id: str) -> Dict[str, Any]:
        """
        Aggregates dashboard stats and monthly historical groupings for Recharts charts.
        """
        if self.is_mock:
            user_txs = [t for t in self.mock_db.transactions if t["user_id"] == user_id]
        else:
            cursor = self.db.transactions.find({"user_id": user_id})
            user_txs = await cursor.to_list(length=1000)
            
        if not user_txs:
            return {
                "stats": {"total_count": 0, "fraud_count": 0, "fraud_percentage": 0.0, "average_risk": 0.0},
                "trend_data": [],
                "risk_distribution": [],
                "payment_distribution": [],
                "monthly_summary": []
            }
            
        total_count = len(user_txs)
        fraud_txs = [t for t in user_txs if t["is_fraud"] == 1]
        fraud_count = len(fraud_txs)
        fraud_percentage = round((fraud_count / total_count) * 100, 2) if total_count > 0 else 0.0
        
        # Calculate avg risk probability
        avg_risk = round(sum(t["probability"] for t in user_txs) / total_count, 2)
        
        # 1. Risk level counts
        low_count = sum(1 for t in user_txs if t["risk_level"] == "low")
        med_count = sum(1 for t in user_txs if t["risk_level"] == "medium")
        high_count = sum(1 for t in user_txs if t["risk_level"] == "high")
        
        risk_dist = [
            {"name": "Low Risk", "value": low_count, "color": "#10B981"},    # Emerald
            {"name": "Medium Risk", "value": med_count, "color": "#F59E0B"}, # Amber
            {"name": "High Risk", "value": high_count, "color": "#EF4444"}    # Red
        ]
        
        # 2. Payment method breakdown
        methods = ['Credit Card', 'Debit Card', 'PayPal', 'Transfer']
        payment_dist = []
        for m in methods:
            m_txs = [t for t in user_txs if t["payment_method"] == m]
            payment_dist.append({
                "name": m,
                "total": len(m_txs),
                "fraud": sum(1 for t in m_txs if t["is_fraud"] == 1)
            })
            
        # 3. Monthly / Daily trend groupings (Group by transaction_date day for the last 15 days)
        # To make a gorgeous chart, let's group by transaction day
        daily_groups = {}
        for t in user_txs:
            dt = datetime.fromisoformat(t["transaction_date"])
            day_str = dt.strftime("%b %d")
            if day_str not in daily_groups:
                daily_groups[day_str] = {"date": day_str, "Safe": 0, "Suspicious": 0, "Total": 0}
            
            if t["is_fraud"] == 1 or t["risk_level"] == "high":
                daily_groups[day_str]["Suspicious"] += 1
            else:
                daily_groups[day_str]["Safe"] += 1
            daily_groups[day_str]["Total"] += 1
            
        # Convert to list and limit to last 15 days (sorted by date chronologically)
        sorted_days = sorted(daily_groups.items(), key=lambda x: datetime.strptime(f"{x[0]} {datetime.utcnow().year}", "%b %d %Y"))
        trend_data = [v for k, v in sorted_days[-15:]]
        
        # 4. Monthly analytics aggregated summary (Recharts bar chart)
        monthly_groups = {}
        for t in user_txs:
            dt = datetime.fromisoformat(t["transaction_date"])
            month_str = dt.strftime("%B")
            if month_str not in monthly_groups:
                monthly_groups[month_str] = {"month": month_str, "Safe": 0, "Fraud": 0, "Total": 0}
            
            if t["is_fraud"] == 1:
                monthly_groups[month_str]["Fraud"] += 1
            else:
                monthly_groups[month_str]["Safe"] += 1
            monthly_groups[month_str]["Total"] += 1
            
        # Render a structured sorting by month order
        month_order = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"]
        sorted_months = sorted(
            [v for k, v in monthly_groups.items()],
            key=lambda x: month_order.index(x["month"]) if x["month"] in month_order else 99
        )
        
        return {
            "stats": {
                "total_count": total_count,
                "fraud_count": fraud_count,
                "fraud_percentage": fraud_percentage,
                "average_risk": avg_risk
            },
            "risk_distribution": risk_dist,
            "payment_distribution": payment_dist,
            "trend_data": trend_data,
            "monthly_summary": sorted_months
        }

db_manager = DatabaseManager()
