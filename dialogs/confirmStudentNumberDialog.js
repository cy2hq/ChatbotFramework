const { ComponentDialog, NumberPrompt, ConfirmPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

var validStudentNumber;
var validCounter = 0;

const CONFIRM_STUDENT_NUMBER_DIALOG = 'CONFIRM_STUDENT_NUMBER_DIALOG';

class ConfirmStudentNumberDialog extends ComponentDialog {
    constructor() {
        super(CONFIRM_STUDENT_NUMBER_DIALOG);
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.studentNumberStep.bind(this),
            this.studentNumberConfirmStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async studentNumberStep(step) {
        return await step.prompt(NUMBER_PROMPT, 'Please enter your student number.');
    }

    async studentNumberConfirmStep(step) {
        console.log(step.result);
        this.checkStudentNumber(step.result);
        if (validStudentNumber === true && validCounter === 0) {
            console.log('Valid student number');
            return await step.endDialog(true);
        } if (validStudentNumber === false) {
            await step.context.sendActivity('Invalid student number. You can find it on your student card.');
            return await step.replaceDialog(CONFIRM_STUDENT_NUMBER_DIALOG);
        } if (validStudentNumber === false && validCounter === 2) {
            return await step.endDialog(false);
        }
    }

    checkStudentNumber(studentNumber) {
        if (studentNumber === 123456) {
            validStudentNumber = true;
            validCounter = 0;
        } else {
            validStudentNumber = false;
            validCounter++;
        }
    }
}

module.exports.ConfirmStudentNumberDialog = ConfirmStudentNumberDialog;
module.exports.CONFIRM_STUDENT_NUMBER_DIALOG = CONFIRM_STUDENT_NUMBER_DIALOG;
