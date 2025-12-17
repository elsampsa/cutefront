import { Group } from './group.js';
import { Signal, Widget } from './widget.js';

class TabWidget extends Group {
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }

    createSignals() {
        super.createSignals();
        this.signals.tabChanged = new Signal(); // Emitted when a tab is changed
    }

    createElement() {
        this.autoElement();
        /*
        this.element.innerHTML = `
            <ul class="nav nav-tabs" role="tablist"></ul>
            <div class="tab-content mt-2"></div>
        `;
        */

        this.element.innerHTML = `
            <ul class="nav nav-tabs flex-grow-1" role="tablist"></ul>
            <div class="tab-content mt-2 w-100"></div>
        `;

        this.tabList = this.element.querySelector('.nav-tabs');
        this.tabContent = this.element.querySelector('.tab-content');
    }

    createState() {
        super.createState();
        this.tabs = [];
        this.activeTabIndex = 0;
    }
    
    setItems(widget_dict) { /*//DOC 
        Set the tab widgets with their identifiers and display names.
        
        Example:
        tabWidget.setItems({
            homeWidget: [homeWidget, "Home"],
            itemsWidget: [itemsWidget, "Items"],
            settingsWidget: [settingsWidget, "Settings"]
        });
 
        Access widgets with:
        this.widgets.homeWidget
        */
        // Validate entries
        Object.entries(widget_dict).forEach(([key, pair]) => {
            if (!(pair[0] instanceof Widget)) {
                this.err("First element of pair must be Widget instance");
                return;
            }
            if (typeof pair[1] !== 'string') {
                this.err("Second element of pair must be string");
                return;
            }
        });
 
        // Store widget references by key
        this.widgets = Object.entries(widget_dict).reduce((acc, [key, pair]) => {
            acc[key] = pair[0];
            return acc;
        }, {});
 
        // Create tabs array for rendering
        this.tabs = Object.entries(widget_dict).map(([key, pair]) => ({
            widget: pair[0],
            name: pair[1]
        }));
 
        this.renderTabs();
    }

    renderTabs() {
        this.tabList.innerHTML = '';
        this.tabContent.innerHTML = '';
        this.tabs.forEach((tab, index) => {
            const isActive = index === this.activeTabIndex;
            
            // Create tab button
            const tabButton = document.createElement('li');
            tabButton.className = 'nav-item';
            tabButton.innerHTML = `
                <a class="nav-link ${isActive ? 'active' : ''}" 
                   id="tab-${index}"
                   href="#content-${index}" 
                   role="tab"
                   aria-controls="content-${index}" 
                   aria-selected="${isActive}">
                    ${tab.name}
                </a>
            `;
            // data-bs-toggle="tab" -> bootstrap crassssh! & we don't need it anyway since were handling the tab switching outselves.
            this.tabList.appendChild(tabButton);
            
            // Create tab content
            const tabPane = document.createElement('div');
            tabPane.className = `tab-pane fade ${isActive ? 'show active' : ''}`;
            tabPane.id = `content-${index}`;
            tabPane.setAttribute('role', 'tabpanel');
            tabPane.setAttribute('aria-labelledby', `tab-${index}`);
            
            // Move the widget's element into the tab pane
            tabPane.appendChild(tab.widget.element);
            this.tabContent.appendChild(tabPane);
            
            // Remove any inline styles that might be hiding the element
            tab.widget.element.style.removeProperty('display');
            
            // Add click event listener
            tabButton.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.activateTab(index);
            });
        });
     }
     
     activateTab(index) {
        if (index === this.activeTabIndex) return;
        
        // Deactivate current tab
        this.tabList.querySelector('.nav-link.active').classList.remove('active');
        this.tabContent.querySelector('.tab-pane.active').classList.remove('show', 'active');
        
        // Activate new tab
        this.tabList.querySelectorAll('.nav-link')[index].classList.add('active');
        this.tabContent.querySelectorAll('.tab-pane')[index].classList.add('show', 'active');
        
        this.activeTabIndex = index;
        this.signals.tabChanged.emit(this.tabs[index].widget);
     }
     
     show_slot(widget) {
        const index = this.tabs.findIndex(tab => tab.widget === widget);
        if (index !== -1) {
            this.activateTab(index);
        }
     }


    // Override these methods to work with Bootstrap tabs
    hide_all_slot() {
        console.warn("hide_all_slot is not applicable in Tab widget");
    }

    show_all_slot() {
        console.warn("show_all_slot is not applicable in Tab widget");
    }
}

export { TabWidget };
