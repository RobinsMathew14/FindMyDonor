# 📊 MongoDB Data Viewing Guide for FindMyDonor

## 🔗 MongoDB Atlas Connection Details
- **Connection String**: `mongodb+srv://root:root@project0.0kmapns.mongodb.net/?retryWrites=true&w=majority&appName=Project0`
- **Database Name**: `findmydonor`
- **Username**: `root`
- **Password**: `root`

## 🛠️ Ways to View Your Data

### 1. MongoDB Atlas Web Interface (Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login with your credentials
3. Navigate to your cluster "Project0"
4. Click "Browse Collections"
5. Select database "findmydonor"
6. View collections: `users`, `bloodrequests`, `donations`, `bloodinventories`

### 2. MongoDB Compass (Desktop Application)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Install and open MongoDB Compass
3. Connect using: `mongodb+srv://root:root@project0.0kmapns.mongodb.net/findmydonor`
4. Browse collections and documents visually

### 3. MongoDB Shell (mongosh)
```bash
# Connect to your database
mongosh "mongodb+srv://root:root@project0.0kmapns.mongodb.net/findmydonor"

# List all collections
show collections

# View users
db.users.find().pretty()

# View blood requests
db.bloodrequests.find().pretty()

# View donations
db.donations.find().pretty()

# Count documents
db.users.countDocuments()
db.bloodrequests.countDocuments()
db.donations.countDocuments()
```

### 4. VS Code Extension
1. Install "MongoDB for VS Code" extension
2. Connect using the connection string
3. Browse data directly in VS Code

## 📋 Database Collections Structure

### 👥 Users Collection
```javascript
// Sample user document
{
  "_id": ObjectId("..."),
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+919876543210",
  "password": "$2a$12$...", // hashed
  "dateOfBirth": ISODate("1990-05-15"),
  "gender": "male",
  "bloodGroup": "O+",
  "weight": 70,
  "height": 175,
  "userType": "donor",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "district": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Wife",
    "phone": "+919876543211",
    "email": "jane.doe@example.com"
  },
  "healthInfo": {
    "isEligible": true,
    "lastDonation": null,
    "totalDonations": 0,
    "medicalConditions": [],
    "medications": [],
    "allergies": []
  },
  "preferences": {
    "notifications": {
      "email": true,
      "sms": true,
      "push": false
    },
    "privacy": {
      "showPhone": true,
      "showEmail": false,
      "showAddress": true
    }
  },
  "isActive": true,
  "isVerified": false,
  "loginAttempts": 0,
  "lastLogin": ISODate("..."),
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### 🩸 Blood Requests Collection
```javascript
// Sample blood request document
{
  "_id": ObjectId("..."),
  "requestId": "BR-ABC123-XYZ",
  "patientName": "Alice Johnson",
  "patientAge": 35,
  "patientGender": "female",
  "bloodGroup": "A+",
  "bloodComponent": "whole_blood",
  "unitsRequired": 2,
  "urgencyLevel": "urgent",
  "medicalCondition": "Severe anemia due to surgery complications",
  "doctorName": "Dr. Smith Wilson",
  "doctorContact": "+919876543220",
  "hospital": ObjectId("..."), // Reference to hospital user
  "hospitalName": "City General Hospital",
  "hospitalAddress": {
    "street": "456 Hospital Road",
    "city": "Delhi",
    "district": "Central Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "requestedBy": ObjectId("..."), // Reference to user who created request
  "requiredBy": ISODate("2024-12-31T18:00:00.000Z"),
  "description": "Patient requires urgent blood transfusion post-surgery",
  "status": "active",
  "unitsFulfilled": 0,
  "responses": [
    {
      "donor": ObjectId("..."), // Reference to donor
      "responseDate": ISODate("..."),
      "status": "interested",
      "message": "I am available to donate blood. Please contact me.",
      "contactInfo": {
        "phone": "+919876543210",
        "email": "john.doe@example.com"
      }
    }
  ],
  "contactPerson": {
    "name": "Bob Johnson",
    "relationship": "Husband",
    "phone": "+919876543221",
    "email": "bob.johnson@example.com"
  },
  "isEmergency": true,
  "isVerified": false,
  "views": 0,
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### 💉 Donations Collection
```javascript
// Sample donation document
{
  "_id": ObjectId("..."),
  "donationId": "DON-XYZ789-ABC",
  "donor": ObjectId("..."), // Reference to donor
  "donorName": "John Doe",
  "donorBloodGroup": "O+",
  "hospital": ObjectId("..."), // Reference to hospital
  "hospitalName": "City General Hospital",
  "donationType": "voluntary",
  "bloodComponent": "whole_blood",
  "unitsCollected": 1,
  "scheduledDate": ISODate("2024-12-25T10:00:00.000Z"),
  "actualDonationDate": null,
  "timeSlot": {
    "start": "10:00",
    "end": "11:00"
  },
  "preScreening": {
    "weight": 70,
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "pulse": 72,
    "temperature": 36.5,
    "hemoglobin": 14.5,
    "screeningNotes": "All parameters normal",
    "screenedBy": "Nurse Mary",
    "screeningDate": ISODate("...")
  },
  "healthQuestionnaire": {
    "recentIllness": false,
    "medications": [],
    "allergies": [],
    "recentTravel": false,
    "recentVaccination": false,
    "pregnancyStatus": "not_applicable",
    "lastDonationDate": null,
    "riskFactors": [],
    "additionalNotes": ""
  },
  "donationProcess": {
    "startTime": null,
    "endTime": null,
    "collectionMethod": "standard",
    "bagNumber": "",
    "volume": 0,
    "complications": [],
    "collectedBy": ""
  },
  "postDonationCare": {
    "restPeriod": 15,
    "refreshmentsProvided": true,
    "adverseReactions": [],
    "instructions": "",
    "followUpRequired": false
  },
  "bloodTesting": {
    "testingDate": null,
    "testResults": {
      "bloodGroup": "",
      "rhFactor": "",
      "hiv": "pending",
      "hepatitisB": "pending",
      "hepatitisC": "pending",
      "syphilis": "pending",
      "malaria": "pending"
    },
    "qualityGrade": ""
  },
  "status": "scheduled",
  "createdBy": ObjectId("..."),
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## 🔍 Useful MongoDB Queries

### User Analytics
```javascript
// Count users by type
db.users.aggregate([
  { $group: { _id: "$userType", count: { $sum: 1 } } }
])

// Count users by blood group
db.users.aggregate([
  { $match: { userType: "donor" } },
  { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])

// Count users by city
db.users.aggregate([
  { $group: { _id: "$address.city", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Recent registrations (last 7 days)
db.users.find({
  createdAt: { 
    $gte: new Date(Date.now() - 7*24*60*60*1000) 
  }
}).count()
```

### Blood Request Analytics
```javascript
// Count requests by status
db.bloodrequests.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Count requests by blood group
db.bloodrequests.aggregate([
  { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Count requests by urgency
db.bloodrequests.aggregate([
  { $group: { _id: "$urgencyLevel", count: { $sum: 1 } } }
])

// Active requests with responses
db.bloodrequests.find({
  status: "active",
  "responses.0": { $exists: true }
}).count()
```

### Donation Analytics
```javascript
// Count donations by status
db.donations.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Total units collected
db.donations.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: null, totalUnits: { $sum: "$unitsCollected" } } }
])

// Donations by blood group
db.donations.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$donorBloodGroup", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## 📈 Real-time Data Monitoring

### Watch for New Users
```javascript
// In MongoDB shell
db.users.watch([
  { $match: { operationType: "insert" } }
])
```

### Watch for New Blood Requests
```javascript
db.bloodrequests.watch([
  { $match: { operationType: "insert" } }
])
```

## 🔧 Data Management Commands

### Backup Data
```bash
# Export users collection
mongoexport --uri="mongodb+srv://root:root@project0.0kmapns.mongodb.net/findmydonor" --collection=users --out=users_backup.json

# Export all collections
mongodump --uri="mongodb+srv://root:root@project0.0kmapns.mongodb.net/findmydonor" --out=./backup
```

### Clean Test Data
```javascript
// Remove test users (be careful!)
db.users.deleteMany({ email: { $regex: /test|example/ } })

// Remove old blood requests
db.bloodrequests.deleteMany({ 
  requiredBy: { $lt: new Date() },
  status: "active"
})
```

## 🚨 Important Notes

1. **Data Privacy**: Never share real user data or connection strings publicly
2. **Backup**: Always backup data before making bulk changes
3. **Indexing**: The application creates indexes automatically for better performance
4. **Monitoring**: Use MongoDB Atlas monitoring for performance insights
5. **Security**: Consider IP whitelisting and stronger passwords for production

## 📱 Mobile Apps for MongoDB

1. **MongoDB Compass Mobile** (iOS/Android)
2. **Studio 3T** (Desktop with mobile sync)
3. **NoSQLBooster** (Desktop)

## 🔗 Useful Links

- [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
- [MongoDB Compass Download](https://www.mongodb.com/products/compass)
- [MongoDB Shell (mongosh)](https://docs.mongodb.com/mongodb-shell/)
- [MongoDB Query Documentation](https://docs.mongodb.com/manual/tutorial/query-documents/)

---

**Remember**: Your MongoDB Atlas cluster is accessible from anywhere. Monitor usage and set up alerts for unusual activity.