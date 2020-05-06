import mongoose from "mongoose";

const { Schema } = mongoose;

const ConfigSchema = new Schema({
	item: String,
	content: String,
});

const Config = mongoose.model("Config", ConfigSchema);

export default Config;
