import mongoose from "mongoose";

const { Schema } = mongoose;

const AucSchema = new Schema(
	{
		date: Date,
		itemName: String,
		itemId: String,
		avgPrice: Number,
	},
	{ versionKey: false }
);

const Auc = mongoose.model("Auc", AucSchema);

export default Auc;
