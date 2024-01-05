import { reactive } from "vue";

export class GuiController {
  static instance = new GuiController();
  private constructor() {}

  state = reactive({
    isShowChat: false,
  });

  openChat() {
    this.state.isShowChat = true;
  }
}

export const guiController = GuiController.instance;
