const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');

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

// Sample data
const sampleUsers = [
  // Donors
  {
    fullName: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+919876543210",
    password: "Password123",
    dateOfBirth: new Date("1990-05-15"),
    gender: "male",
    bloodGroup: "O+",
    weight: 70,
    height: 175,
    userType: "donor",
    address: {
      street: "123 MG Road",
      city: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    emergencyContact: {
      name: "Priya Sharma",
      relationship: "Wife",
      phone: "+919876543211",
      email: "priya.sharma@example.com"
    },
    isActive: true,
    isVerified: true
  },
  {
    fullName: "Anita Patel",
    email: "anita.patel@example.com",
    phone: "+919876543212",
    password: "Password123",
    dateOfBirth: new Date("1985-08-22"),
    gender: "female",
    bloodGroup: "A+",
    weight: 55,
    height: 160,
    userType: "donor",
    address: {
      street: "456 Ring Road",
      city: "Ahmedabad",
      district: "Ahmedabad",
      state: "Gujarat",
      pincode: "380001"
    },
    emergencyContact: {
      name: "Kiran Patel",
      relationship: "Husband",
      phone: "+919876543213",
      email: "kiran.patel@example.com"
    },
    isActive: true,
    isVerified: true
  },
  {
    fullName: "Vikram Singh",
    email: "vikram.singh@example.com",
    phone: "+919876543214",
    password: "Password123",
    dateOfBirth: new Date("1992-12-10"),
    gender: "male",
    bloodGroup: "B+",
    weight: 75,
    height: 180,
    userType: "donor",
    address: {
      street: "789 CP Road",
      city: "Delhi",
      district: "Central Delhi",
      state: "Delhi",
      pincode: "110001"
    },
    emergencyContact: {
      name: "Sunita Singh",
      relationship: "Mother",
      phone: "+919876543215",
      email: "sunita.singh@example.com"
    },
    isActive: true,
    isVerified: true
  },
  {
    fullName: "Meera Reddy",
    email: "meera.reddy@example.com",
    phone: "+919876543216",
    password: "Password123",
    dateOfBirth: new Date("1988-03-18"),
    gender: "female",
    bloodGroup: "AB+",
    weight: 60,
    height: 165,
    userType: "donor",
    address: {
      street: "321 Tank Bund Road",
      city: "Hyderabad",
      district: "Hyderabad",
      state: "Telangana",
      pincode: "500001"
    },
    emergencyContact: {
      name: "Ravi Reddy",
      relationship: "Brother",
      phone: "+919876543217",
      email: "ravi.reddy@example.com"
    },
    isActive: true,
    isVerified: true
  },
  {
    fullName: "Arjun Kumar",
    email: "arjun.kumar@example.com",
    phone: "+919876543218",
    password: "Password123",
    dateOfBirth: new Date("1995-07-25"),
    gender: "male",
    bloodGroup: "O-",
    weight: 68,
    height: 172,
    userType: "donor",
    address: {
      street: "654 Brigade Road",
      city: "Bangalore",
      district: "Bangalore Urban",
      state: "Karnataka",
      pincode: "560001"
    },
    emergencyContact: {
      name: "Lakshmi Kumar",
      relationship: "Sister",
      phone: "+919876543219",
      email: "lakshmi.kumar@example.com"
    },
    isActive: true,
    isVerified: true
  },

  // Hospitals
  {
    fullName: "Apollo Hospital Mumbai",
    email: "admin@apollomumbai.com",
    phone: "+912233445566",
    password: "Hospital123",
    dateOfBirth: new Date("1980-01-01"),
    gender: "other",
    bloodGroup: "O+",
    weight: 70,
    height: 170,
    userType: "hospital",
    address: {
      street: "15 Shanti Path",
      city: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      pincode: "400012"
    },
    emergencyContact: {
      name: "Emergency Desk",
      relationship: "Hospital Staff",
      phone: "+912233445567",
      email: "emergency@apollomumbai.com"
    },
    hospitalInfo: {
      hospitalName: "Apollo Hospital Mumbai",
      hospitalType: "private",
      licenseNumber: "MH-HOSP-001",
      registrationNumber: "REG-MH-001",
      establishedYear: 1995,
      bedCapacity: 500,
      specializations: ["Cardiology", "Neurology", "Emergency Medicine", "Oncology"],
      facilities: ["Blood Bank", "ICU", "Emergency Room", "Laboratory", "Pharmacy"],
      operatingHours: {
        is24x7: true
      }
    },
    isActive: true,
    isVerified: true
  },
  {
    fullName: "AIIMS Delhi",
    email: "bloodbank@aiims.edu",
    phone: "+911126588500",
    password: "Hospital123",
    dateOfBirth: new Date("1980-01-01"),
    gender: "other",
    bloodGroup: "O+",
    weight: 70,
    height: 170,
    userType: "hospital",
    address: {
      street: "Ansari Nagar",
      city: "Delhi",
      district: "South Delhi",
      state: "Delhi",
      pincode: "110029"
    },
    emergencyContact: {
      name: "Blood Bank",
      relationship: "Hospital Department",
      phone: "+911126588501",
      email: "bloodbank.emergency@aiims.edu"
    },
    hospitalInfo: {
      hospitalName: "All India Institute of Medical Sciences",
      hospitalType: "government",
      licenseNumber: "DL-HOSP-001",
      registrationNumber: "REG-DL-001",
      establishedYear: 1956,
      bedCapacity: 2500,
      specializations: ["All Medical Specialties"],
      facilities: ["Blood Bank", "Trauma Center", "Research Labs", "Medical College"],
      operatingHours: {
        is24x7: true
      }
    },
    isActive: true,
    isVerified: true
  },
  {
    fullName: "Fortis Hospital Bangalore",
    email: "bloodbank@fortisbangalore.com",
    phone: "+918066281010",
    password: "Hospital123",
    dateOfBirth: new Date("1980-01-01"),
    gender: "other",
    bloodGroup: "O+",
    weight: 70,
    height: 170,
    userType: "hospital",
    address: {
      street: "154/9, Bannerghatta Road",
      city: "Bangalore",
      district: "Bangalore Urban",
      state: "Karnataka",
      pincode: "560076"
    },
    emergencyContact: {
      name: "Emergency Services",
      relationship: "Hospital Department",
      phone: "+918066281011",
      email: "emergency@fortisbangalore.com"
    },
    hospitalInfo: {
      hospitalName: "Fortis Hospital Bannerghatta Road",
      hospitalType: "private",
      licenseNumber: "KA-HOSP-001",
      registrationNumber: "REG-KA-001",
      establishedYear: 2006,
      bedCapacity: 400,
      specializations: ["Cardiac Sciences", "Neurosciences", "Orthopedics", "Oncology"],
      facilities: ["Blood Bank", "Cath Lab", "Emergency", "Diagnostics"],
      operatingHours: {
        is24x7: true
      }
    },
    isActive: true,
    isVerified: true
  },

  // Admin
  {
    fullName: "System Administrator",
    email: "admin@findmydonor.com",
    phone: "+919999999999",
    password: "Admin123",
    dateOfBirth: new Date("1985-01-01"),
    gender: "other",
    bloodGroup: "O+",
    weight: 70,
    height: 170,
    userType: "admin",
    address: {
      street: "Admin Office",
      city: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    emergencyContact: {
      name: "Support Team",
      relationship: "Colleague",
      phone: "+919999999998",
      email: "support@findmydonor.com"
    },
    isActive: true,
    isVerified: true
  }
];

const sampleBloodRequests = [
  {
    patientName: "Rajesh Gupta",
    patientAge: 45,
    patientGender: "male",
    bloodGroup: "O+",
    bloodComponent: "whole_blood",
    unitsRequired: 2,
    urgencyLevel: "critical",
    medicalCondition: "Severe blood loss due to accident",
    doctorName: "Dr. Amit Sharma",
    doctorContact: "+919876543220",
    hospitalName: "Apollo Hospital Mumbai",
    hospitalAddress: {
      street: "15 Shanti Path",
      city: "Mumbai",
      district: "Mumbai",
      state: "Maharashtra",
      pincode: "400012"
    },
    requiredBy: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    description: "Patient met with a road accident and requires immediate blood transfusion",
    contactPerson: {
      name: "Sunita Gupta",
      relationship: "Wife",
      phone: "+919876543221",
      email: "sunita.gupta@example.com"
    },
    isEmergency: true,
    status: "active"
  },
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
    hospitalName: "Fortis Hospital Bangalore",
    hospitalAddress: {
      street: "154/9, Bannerghatta Road",
      city: "Bangalore",
      district: "Bangalore Urban",
      state: "Karnataka",
      pincode: "560076"
    },
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
    hospitalName: "AIIMS Delhi",
    hospitalAddress: {
      street: "Ansari Nagar",
      city: "Delhi",
      district: "South Delhi",
      state: "Delhi",
      pincode: "110029"
    },
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
  }
];

// Function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// Insert sample data
const insertSampleData = async () => {
  try {
    console.log('🧹 Cleaning existing data...');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await BloodRequest.deleteMany({});
    // await Donation.deleteMany({});
    
    console.log('👥 Inserting sample users...');
    
    // Hash passwords for all users
    for (let user of sampleUsers) {
      user.password = await hashPassword(user.password);
    }
    
    // Insert users
    const insertedUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${insertedUsers.length} users`);
    
    // Get hospital users for blood requests
    const hospitals = insertedUsers.filter(user => user.userType === 'hospital');
    
    console.log('🩸 Inserting sample blood requests...');
    
    // Add hospital references to blood requests
    sampleBloodRequests.forEach((request, index) => {
      const hospital = hospitals[index % hospitals.length];
      request.hospital = hospital._id;
      request.requestedBy = hospital._id;
    });
    
    // Insert blood requests
    const insertedRequests = await BloodRequest.insertMany(sampleBloodRequests);
    console.log(`✅ Inserted ${insertedRequests.length} blood requests`);
    
    console.log('📊 Sample data insertion completed successfully!');
    console.log('\n🔍 You can now view the data in:');
    console.log('1. MongoDB Atlas Web Interface');
    console.log('2. MongoDB Compass');
    console.log('3. Your application');
    console.log('4. Postman API calls');
    
    console.log('\n📋 Sample Login Credentials:');
    console.log('Donors:');
    console.log('- rahul.sharma@example.com / Password123');
    console.log('- anita.patel@example.com / Password123');
    console.log('- vikram.singh@example.com / Password123');
    console.log('\nHospitals:');
    console.log('- admin@apollomumbai.com / Hospital123');
    console.log('- bloodbank@aiims.edu / Hospital123');
    console.log('- bloodbank@fortisbangalore.com / Hospital123');
    console.log('\nAdmin:');
    console.log('- admin@findmydonor.com / Admin123');
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await insertSampleData();
};

main().catch(console.error);