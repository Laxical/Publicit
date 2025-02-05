import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    products: { type: Map, of: String }, // Mapping product -> wallet address
  });
  const Company = mongoose.model('Company', companySchema);


export default Company;