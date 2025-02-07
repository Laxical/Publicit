import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  products: {
    type: Map,
    of: {
      walletAddress: { type: String, required: true },
      imageUrl: { type: String, required: true },
      productUrl: { type: String, required: true },
      walletUniqueId: { type: String, required: true },
      policyId:{type:String,required:true},
      userReward:{type:Number,required:true},
      websiteCommission:{type:Number,required:true},
      
    },
  },
});

const Company = mongoose.model('Company', companySchema);

export default Company;