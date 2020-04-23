import mongoose from 'mongoose';

const { Schema } = mongoose;

const AucSchema = new Schema({
  date: Date,
  itemName: String,
  itemId: String,
  avgPrice: Number,
});

const Auc = mongoose.model('Auc', AucSchema);
export default Auc;
