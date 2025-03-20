import { mount, el } from "../../node_modules/redom/dist/redom.es";

export default class Input {
  constructor(settings = {}) {
    const {
      label = "",
      type = "",
      placeholder = "",
      required = false,
    } = settings;

    this._prop = {
      label,
      type,
      placeholder,
      required,
    };
    this.el = this._ui_render();
  }

  updateLabel = (label) => {
    // TODO:
    console.log("input. change lang", label);
  };

  _ui_render = () => {
    const { 
      label,
      type,
      placeholder,
      required,  
    } = this._prop;
    return (
      <div className="form-group">
        <label>
          {label}
          <input
            type={type}
            className="form-control"
            placeholder={placeholder}
            {required ? "required" : null}
          />
        </label>
        <div className="invalid-feedback">Please provide a valid email.</div>
      </div>
    );
  };
}
