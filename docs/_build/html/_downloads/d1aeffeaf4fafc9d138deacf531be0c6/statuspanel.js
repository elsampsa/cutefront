// Beginning of file "statuspanel.js"
import { Widget } from '../lib/base/widget.js';

class StatusPanel extends Widget { /*//DOC
    Status panel that shows the statuses of conveyor belt, robot arm and the polishing blade
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }

    createSignals() { // no signals emitted
    }

    belt_status_slot(status) { /*//DOC
        Sets conveyor belt status.  
        Input: string with value "ok", "error", or any other string (that sets the status to n/a)
        */
        this.services["Conveyor Belt"] = status;
        this.updateTable();
    }

    arm_status_slot(status) { /*//DOC
        Sets robot arm status.  
        Input: string with value "ok", "error", or any other string (that sets the status to n/a)
        */
        this.services["Robot Arm"] = status;
        this.updateTable();
    }

    blade_status_slot(status) { /*//DOC
        Sets polishing blade status.  
        Input: string with value "ok", "error", or any other string (that sets the status to n/a)
        */
        this.services["Polishing Blade"] = status;
        this.updateTable();
    }

    createState() {
        if (this.element == null) {
            return;
        }
        this.services = {
            "Conveyor Belt": "n/a",
            "Robot Arm": "n/a",
            "Polishing Blade": "n/a"
        };
        this.updateTable();
    }

    createElement() {
        this.element = document.getElementById(this.id);
        if (this.element == null) {
            console.error("Could not find element with id", this.id);
            return;
        }

        // Create table header
        this.element.innerHTML = `
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
    }

    updateTable() {
        const tbody = this.element.querySelector("tbody");
        tbody.innerHTML = "";

        for (const [service, status] of Object.entries(this.services)) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${service}</td>
                <td><span class="badge ${this.getStatusBadgeClass(status)}">${status.toUpperCase()}</span></td>
            `;
            tbody.appendChild(row);
        }
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case "ok":
                return "bg-success";
            case "error":
                return "bg-danger";
            default:
                return "bg-secondary";
        }
    }

}

export { StatusPanel }
// End of file "statuspanel.js"
