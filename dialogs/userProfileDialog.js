class UserProfileDialog extends ComponentDialog{
    constructor(userState) {
        super('userProfileDialog');
    
        this.userProfile = userState.createProperty(USER_PROFILE);
    
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));
    
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.transportStep.bind(this),
            this.nameStep.bind(this),
            this.nameConfirmStep.bind(this),
            this.ageStep.bind(this),
            this.confirmStep.bind(this),
            this.summaryStep.bind(this)
        ]));
    
        this.initialDialogId = WATERFALL_DIALOG;
    }
    async nameStep(step){
        return await step.prompt(NAME_PROMPT, `What is your name, human?`);
    }

    async nameConfirmStep(step) {
        
    }




}