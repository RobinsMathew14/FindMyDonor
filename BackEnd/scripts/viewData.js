const mongoose = require('mongoose');
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

// View all data
const viewData = async () => {
  try {
    console.log('📊 DATABASE OVERVIEW');
    console.log('='.repeat(50));
    
    // Users
    const totalUsers = await User.countDocuments();
    const donors = await User.countDocuments({ userType: 'donor' });
    const hospitals = await User.countDocuments({ userType: 'hospital' });
    const admins = await User.countDocuments({ userType: 'admin' });
    
    console.log(`\n👥 USERS (Total: ${totalUsers})`);
    console.log(`   Donors: ${donors}`);
    console.log(`   Hospitals: ${hospitals}`);
    console.log(`   Admins: ${admins}`);
    
    // Blood Requests
    const totalRequests = await BloodRequest.countDocuments();
    const activeRequests = await BloodRequest.countDocuments({ status: 'active' });
    
    console.log(`\n🩸 BLOOD REQUESTS (Total: ${totalRequests})`);
    console.log(`   Active: ${activeRequests}`);
    
    // Donations
    const totalDonations = await Donation.countDocuments();
    const scheduledDonations = await Donation.countDocuments({ status: 'scheduled' });
    
    console.log(`\n💉 DONATIONS (Total: ${totalDonations})`);
    console.log(`   Scheduled: ${scheduledDonations}`);
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 SAMPLE LOGIN CREDENTIALS');
    console.log('='.repeat(50));
    
    // Get sample users
    const sampleDonors = await User.find({ userType: 'donor' }).limit(3).select('fullName email');
    const sampleHospitals = await User.find({ userType: 'hospital' }).limit(3).select('fullName email');
    const sampleAdmins = await User.find({ userType: 'admin' }).limit(1).select('fullName email');
    
    console.log('\n🩸 DONORS (Password: Password123)');
    sampleDonors.forEach(user => {
      console.log(`   ${user.fullName}: ${user.email}`);
    });
    
    console.log('\n🏥 HOSPITALS (Password: Hospital123)');
    sampleHospitals.forEach(user => {
      console.log(`   ${user.fullName}: ${user.email}`);
    });
    
    console.log('\n👑 ADMINS (Password: Admin123)');
    sampleAdmins.forEach(user => {
      console.log(`   ${user.fullName}: ${user.email}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('🔍 BLOOD GROUP DISTRIBUTION');
    console.log('='.repeat(50));
    
    const bloodGroupStats = await User.aggregate([
      { $match: { userType: 'donor' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    bloodGroupStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} donors`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('🌍 LOCATION DISTRIBUTION');
    console.log('='.repeat(50));
    
    const locationStats = await User.aggregate([
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    locationStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} users`);
    });
    
    if (totalRequests > 0) {
      console.log('\n' + '='.repeat(50));
      console.log('🆘 ACTIVE BLOOD REQUESTS');
      console.log('='.repeat(50));
      
      const activeBloodRequests = await BloodRequest.find({ status: 'active' })
        .select('patientName bloodGroup urgencyLevel hospitalName requiredBy')
        .limit(5);
      
      activeBloodRequests.forEach(request => {
        const timeLeft = Math.ceil((new Date(request.requiredBy) - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`   ${request.patientName} (${request.bloodGroup}) - ${request.urgencyLevel.toUpperCase()}`);
        console.log(`   Hospital: ${request.hospitalName}`);
        console.log(`   Time left: ${timeLeft} days\n`);
      });
    }
    
    console.log('='.repeat(50));
    console.log('🚀 NEXT STEPS');
    console.log('='.repeat(50));
    console.log('1. Import Postman collection: FindMyDonor_API_Collection.postman_collection.json');
    console.log('2. Test API endpoints using the credentials above');
    console.log('3. View data in MongoDB Atlas: https://cloud.mongodb.com/');
    console.log('4. Start the frontend: cd FrontEnd && npm run dev');
    console.log('5. Backend is running on: http://localhost:5000');
    console.log('6. API Documentation: http://localhost:5000/api');
    
  } catch (error) {
    console.error('❌ Error viewing data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await viewData();
};

main().catch(console.error);