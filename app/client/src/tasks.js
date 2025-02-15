import { el } from "../node_modules/redom/dist/redom.es";

class Task {
  constructor(name, end_date, urgency) {
    this.uuid = crypto.randomUUID();
    this.name = name;
    this.end_date = end_date;
    this.urgency = urgency;
  }
}

// TODO
let data = [
  new Task("Fix login bug", "2023-10-01", "High"),
  new Task("Update documentation", "2023-10-02", "Low"),
  new Task("Optimize database queries", "2023-10-03", "Medium"),
  new Task("Design new dashboard", "2023-10-04", "High"),
  new Task("Test API endpoints", "2023-10-05", "Medium"),
];

export class Tasks {
  constructor(context) {
    this.context = context;
    this.render();
  }

  update() {
    console.log(this.context);
    this.render();
  }

  generateRows() {
    return data.map((task) => (
      <tr>
        <td>{task.name}</td>
        <td>{task.end_date}</td>
        <td>{task.urgency}</td>
        <td>
          <i className="bi bi-pencil"></i>
        </td>
        <td>
          <i className="bi bi-trash"></i>
        </td>
      </tr>
    ));
  }

  render() {
    this.el = (
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          {}
          <thead>
            <tr>
              <th>Task</th>
              <th>Date</th>
              <th>Severity</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>{this.generateRows()}</tbody>
        </table>
      </div>
    );
  }
}
