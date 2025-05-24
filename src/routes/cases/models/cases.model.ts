import * as mongoose from "mongoose";

const CasesSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
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
        id: String,
        params: {
            width: String,
            height: String,
            color: String,
            backgroundColor: String,
            font: String,
            fontSize: String,
            fontWeight: String,
            borderSize: String,
            borderColor: String,
        },
        click: Boolean,
        redirectUrl: String
    }]
}, {
    timestamps: true
});

export const casesSchema = mongoose.model("Cases", CasesSchema);
