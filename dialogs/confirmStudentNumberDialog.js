const { ComponentDialog, NumberPrompt, ConfirmPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { fetch } = require('node-fetch');
const { CardFactory } = require('botbuilder');

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

var validStudentNumber;
var validCounter = 0;

const CONFIRM_STUDENT_NUMBER_DIALOG = 'CONFIRM_STUDENT_NUMBER_DIALOG';

class ConfirmStudentNumberDialog extends ComponentDialog {
    constructor() {
        super(CONFIRM_STUDENT_NUMBER_DIALOG);
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.studentNumberValidator));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.studentNumberStep.bind(this),
            this.studentNumberConfirmStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async studentNumberStep(step) {
        const promptOptions = {
            prompt: `Please enter your 6 digit student number. (123456)`,
            retryPrompt: `Invalid student number.\n Please enter it again.`
        };
        return await step.prompt(NUMBER_PROMPT, promptOptions);
    }

    async studentNumberConfirmStep(step) {
        console.log(`Input: ` + step.result);
        var fakeJSON = await this.getJSON(step.result);
        console.log(`JSON Studentnumber: ` + JSON.stringify(fakeJSON.studentnumber));
        var studentNumberFakeJSON = JSON.stringify(fakeJSON.studentnumber);
        this.checkStudentNumber(step.result, studentNumberFakeJSON);
        if (validStudentNumber === true && validCounter === 0) {
            console.log('Valid student number');
            return await step.endDialog(true);
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

    async checkStudentNumber(studentNumber, jsonStudentNumber) {
        if (String(studentNumber) === String(jsonStudentNumber)) {
            validStudentNumber = true;
            validCounter = 0;
        } else {
            validStudentNumber = false;
            validCounter++;
        }
    }

    async studentNumberValidator(value) {
        if (value.recognized.succeeded && value.attemptCount < 2 && value.recognized.value > 0 && value.recognized.value < 999999) {
            return true;
        } else {
            return false;
        }
    }

    async getJSON(studentNumber) {
        var studentToFetch = 'https://my-json-server.typicode.com/MaartenBlomer/FakeStudentJSON/students/' + studentNumber;
        return fetch(studentToFetch)
            .then(response => {
                var json = response.json();
                return json;
            });
    }
}

module.exports.ConfirmStudentNumberDialog = ConfirmStudentNumberDialog;
module.exports.CONFIRM_STUDENT_NUMBER_DIALOG = CONFIRM_STUDENT_NUMBER_DIALOG;
