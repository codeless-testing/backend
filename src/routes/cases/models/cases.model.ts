import * as mongoose from "mongoose";

const CasesSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    cases: [{
        class: String,
        params: {
            width: String,
            height: String,
            color: String,
            backgroundColor: String,
            font: String,
            fontSize: String,
            borderSize: String,
            borderColor: String,
        },
        redirectUrl: String
    }]
}, {
    timestamps: true
});

export const casesSchema = mongoose.model("Cases", CasesSchema);
