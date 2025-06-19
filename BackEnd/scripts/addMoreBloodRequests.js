const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Add blood requests one by one
const addBloodRequests = async () => {
  try {
    console.log('🏥 Getting hospital users...');
    
    // Get hospital users
    const hospitals = await User.find({ userType: 'hospital' });
    
    if (hospitals.length === 0) {
      console.log('❌ No hospitals found. Please run insertSampleData.js first.');
      return;
    }
    
    console.log(`✅ Found ${hospitals.length} hospitals`);
    
    const bloodRequestsData = [
      {
        patientName: "Kavya Nair",
        patientAge: 28,
        patientGender: "female",
        bloodGroup: "A+",
        bloodComponent: "red_cells",
        unitsRequired: 1,
        urgencyLevel: "urgent",
        medicalCondition: "Anemia during pregnancy",
        doctorName: "Dr. Priya Menon",
        doctorContact: "+919876543222",
        hospitalName: hospitals[1] ? hospitals[1].fullName : hospitals[0].fullName,
        hospitalAddress: hospitals[1] ? hospitals[1].address : hospitals[0].address,
        hospital: hospitals[1] ? hospitals[1]._id : hospitals[0]._id,
        requestedBy: hospitals[1] ? hospitals[1]._id : hospitals[0]._id,
        requiredBy: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        description: "Pregnant patient with severe anemia needs blood transfusion",
        contactPerson: {
          name: "Arun Nair",
          relationship: "Husband",
          phone: "+919876543223",
          email: "arun.nair@example.com"
        },
        isEmergency: false,
        status: "active"
      },
      {
        patientName: "Mohammad Ali",
        patientAge: 35,
        patientGender: "male",
        bloodGroup: "B+",
        bloodComponent: "platelets",
        unitsRequired: 3,
        urgencyLevel: "critical",
        medicalCondition: "Dengue fever with low platelet count",
        doctorName: "Dr. Rajesh Kumar",
        doctorContact: "+919876543224",
        hospitalName: hospitals[2] ? hospitals[2].fullName : hospitals[0].fullName,
        hospitalAddress: hospitals[2] ? hospitals[2].address : hospitals[0].address,
        hospital: hospitals[2] ? hospitals[2]._id : hospitals[0]._id,
        requestedBy: hospitals[2] ? hospitals[2]._id : hospitals[0]._id,
        requiredBy: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        description: "Dengue patient with critically low platelet count",
        contactPerson: {
          name: "Fatima Ali",
          relationship: "Wife",
          phone: "+919876543225",
          email: "fatima.ali@example.com"
        },
        isEmergency: true,
        status: "active"
      },
      {
        patientName: "Priya Sharma",
        patientAge: 32,
        patientGender: "female",
        bloodGroup: "AB+",
        bloodComponent: "plasma",
        unitsRequired: 2,
        urgencyLevel: "normal",
        medicalCondition: "Liver disease requiring plasma exchange",
        doctorName: "Dr. Suresh Patel",
        doctorContact: "+919876543226",
        hospitalName: hospitals[0].fullName,
        hospitalAddress: hospitals[0].address,
        hospital: hospitals[0]._id,
        requestedBy: hospitals[0]._id,
        requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        description: "Patient needs plasma for therapeutic plasma exchange",
        contactPerson: {
          name: "Rohit Sharma",
          relationship: "Brother",
          phone: "+919876543227",
          email: "rohit.sharma@example.com"
        },
        isEmergency: false,
        status: "active"
      },
      {
        patientName: "Deepak Kumar",
        patientAge: 50,
        patientGender: "male",
        bloodGroup: "O-",
        bloodComponent: "whole_blood",
        unitsRequired: 4,
        urgencyLevel: "urgent",
        medicalCondition: "Major surgery complications",
        doctorName: "Dr. Neha Singh",
        doctorContact: "+919876543228",
        hospitalName: hospitals[1] ? hospitals[1].fullName : hospitals[0].fullName,
        hospitalAddress: hospitals[1] ? hospitals[1].address : hospitals[0].address,
        hospital: hospitals[1] ? hospitals[1]._id : hospitals[0]._id,
        requestedBy: hospitals[1] ? hospitals[1]._id : hospitals[0]._id,
        requiredBy: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        description: "Post-surgery patient requires urgent blood transfusion",
        contactPerson: {
          name: "Meera Kumar",
          relationship: "Wife",
          phone: "+919876543229",
          email: "meera.kumar@example.com"
        },
        isEmergency: true,
        status: "active"
      }
    ];
    
    console.log('🩸 Inserting blood requests one by one...');
    
    const insertedRequests = [];
    
    for (let i = 0; i < bloodRequestsData.length; i++) {
      try {
        const request = new BloodRequest(bloodRequestsData[i]);
        const savedRequest = await request.save();
        insertedRequests.push(savedRequest);
        console.log(`✅ Inserted: ${savedRequest.patientName} (${savedRequest.requestId})`);
      } catch (error) {
        console.log(`❌ Failed to insert request ${i + 1}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${insertedRequests.length} blood requests`);
    
    // Display the requests
    if (insertedRequests.length > 0) {
      console.log('\n📋 BLOOD REQUESTS CREATED:');
      console.log('='.repeat(60));
      
      insertedRequests.forEach((request, index) => {
        console.log(`${index + 1}. ${request.patientName} (${request.bloodGroup})`);
        console.log(`   Urgency: ${request.urgencyLevel.toUpperCase()}`);
        console.log(`   Hospital: ${request.hospitalName}`);
        console.log(`   Required by: ${request.requiredBy.toDateString()}`);
        console.log(`   Request ID: ${request.requestId}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error adding blood requests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await addBloodRequests();
};

main().catch(console.error);