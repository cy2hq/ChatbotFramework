const {
    ComponentDialog,
    ConfirmPrompt,
    WaterfallDialog,
    TextPrompt
} = require('botbuilder-dialogs');
const rp = require('request-promise');
const CardFactory = require('botbuilder');

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const STUDENTNUMBER_CHECK = 'STUDENTNUMBER_CHECK';

var validCounter = 0;

const CONFIRM_STUDENT_NUMBER_DIALOG = 'CONFIRM_STUDENT_NUMBER_DIALOG';

class ConfirmStudentNumberDialog extends ComponentDialog {
    constructor() {
        super(CONFIRM_STUDENT_NUMBER_DIALOG);
        this.addDialog(new TextPrompt(STUDENTNUMBER_CHECK));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.studentNumberStep.bind(this),
            this.studentNumberConfirmStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async studentNumberStep(step) {
        await step.context.sendActivity('What is your student number? (GW7014)');
        return await step.prompt(STUDENTNUMBER_CHECK);
    }

    async studentNumberConfirmStep(step) {
        console.log(`Input: ` + step.result);
        var validStudentNumber = await this.checkValidStudent(step.result);
        console.log('Valid student number: ' + validStudentNumber);
        if (validStudentNumber === true && validCounter === 0) {
            return await step.endDialog(step.result);
        } if (validStudentNumber === false) {
            await step.context.sendActivity('Invalid student number. You can find the number on your student card.');
            const studentCard = { attachments:
                [CardFactory.heroCard(
                    '',
                    '',
                    ['https://jstmedia.nl/img/stg/studentcard.png'],
                    []
                )] };
            await step.context.sendActivity(studentCard);
            return await step.replaceDialog(CONFIRM_STUDENT_NUMBER_DIALOG);
        } if (validStudentNumber === false && validCounter === 2) {
            return await step.endDialog(false);
        }
    }

    async checkValidStudent(studentNumber) {
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
                result = JSON.stringify(parsedjson['data']['query']['numrows']);
                console.log('Found: ' + result);
                if (result === 0) {
                    result = false;
                    validCounter += 1;
                    return result;
                } else {
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

module.exports.ConfirmStudentNumberDialog = ConfirmStudentNumberDialog;
module.exports.CONFIRM_STUDENT_NUMBER_DIALOG = CONFIRM_STUDENT_NUMBER_DIALOG;
