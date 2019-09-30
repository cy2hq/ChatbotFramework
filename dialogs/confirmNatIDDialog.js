const {
    ComponentDialog,
    ConfirmPrompt,
    WaterfallDialog,
    TextPrompt
} = require('botbuilder-dialogs');
const rp = require('request-promise');

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const STUDENTNATID_CHECK = 'STUDENTNATID_CHECK';

var validCounter = 0;
var studentID;

const CONFIRM_NAT_ID_DIALOG = 'CONFIRM_NAT_ID_DIALOG';

class ConfirmNatIDDialog extends ComponentDialog {
    constructor() {
        super(CONFIRM_NAT_ID_DIALOG);
        this.addDialog(new TextPrompt(STUDENTNATID_CHECK));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.studentNatIDStep.bind(this),
            this.studentNumberConfirmStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async studentNatIDStep(step) {
        console.log('Inside NatIDDialog: ' + step.options);
        studentID = step.options;
        await step.context.sendActivity('What is your national ID? (64367630114)');
        return await step.prompt(STUDENTNATID_CHECK);
    }

    async studentNumberConfirmStep(step) {
        console.log(`Input: ` + step.result);
        var validStudentNatID = await this.checkValidStudent(studentID, step.result);
        console.log('Valid student number: ' + validStudentNatID);
        if (validStudentNatID === true && validCounter === 0) {
            return await step.endDialog(true);
        } if (validStudentNatID === false) {
            await step.context.sendActivity('Invalid national ID.');
            return await step.replaceDialog(CONFIRM_NAT_ID_DIALOG);
        } if (validStudentNatID === false && validCounter === 2) {
            return await step.endDialog(false);
        }
    }

    async checkValidStudent(studentNumber, studentNatID) {
        const options = {
            url: 'https://cy2-cs92.mcx.nl/PSIGW/RESTListeningConnector/PSFT_CS/ExecuteQuery.v1/public/CY2_ODA_PERDATA/JSON/NONFILE?isconnectedquery=N&maxrows=200&prompt_uniquepromptname=BIND1&prompt_fieldvalue=' + studentNumber + '&json_resp=true',
            method: 'GET',
            auth: {
                username: 'PSSLI',
                password: 'PSSLI'
            }
        };
        var result;

        await rp(options)
            .then(function(json) {
                var parsedjson = JSON.parse(json);
                result = JSON.stringify(parsedjson['data']['query']['rows'][0]['NATIONALID']);
                result = result.replace(/"/g, '');
                console.log('Found: ' + result);
                if (result !== studentNatID) {
                    result = false;
                    validCounter += 1;
                    return result;
                } else if (result === studentNatID) {
                    result = true;
                    validCounter = 0;
                    return result;
                }
            })
            .catch(function(err) {
                console.log('OOF :' + err);
            });

        return result;
    }
}

module.exports.ConfirmNatIDDialog = ConfirmNatIDDialog;
module.exports.CONFIRM_NAT_ID_DIALOG = CONFIRM_NAT_ID_DIALOG;
