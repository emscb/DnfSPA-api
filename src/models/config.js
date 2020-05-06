import mongoose from "mongoose";

const { Schema } = mongoose;

const ConfigSchema = new Schema(
	{
		item: String,
		content: String,
	},
	{ versionKey: false }
);

const Config = mongoose.model("Config", ConfigSchema);

export default Config;
