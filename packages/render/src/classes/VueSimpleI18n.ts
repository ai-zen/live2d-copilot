import { reactive } from "vue";
import { SimpleI18n } from "live2d-copilot-shared/src/classes/SimpleI18n";

export class VueSimpleI18n extends SimpleI18n {
  constructor(initState: SimpleI18n["state"]) {
    super(reactive(initState) as SimpleI18n["state"]);
  }
}
