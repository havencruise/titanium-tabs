/* Usage: 
 * var tabs = require('/ui/common/tabs'),
 *     tabView = Ti.UI.createView({ width: '910dp', height: '690dp' });
 * tabs.tabView = tabView;
 *
 * // optional to create custom animations
 * //   tabs.openAnimation = slideOpenAnimation;
 * //   tabs.closeAnimation = slideCloseAnimation;
 * 
 * // create the tabs
 * _.each(tabItems, function(tabItem){
 *     tabs.newTab(tabItem);
 * });
 * 
 * win.add(tabs.getTabs());
 * win.add(tabView);
 */
// Publicly visible func
function Tabs(tabView){
    // private
    var tabView = !!tabView ? tabView : undefined, 
        tabs = [], prevX = 0,
        // controls
        increments = 200, spacer = 20,   // dist between tabs
        tabWidth = '200dp',
        tabHeight = '50dp',
        tabBackgroundColor = '#666',
        selectedBackgroundColor = '#e0e0e0',
        darkLabelColor = '#444',
        lightLabelColor = '#eee',
        tabBorderColor = '#333',
        tabContainer = Ti.UI.createView({
            width: Ti.UI.FILL, height: tabHeight,
        }),
        separator = Ti.UI.createView({
            // serves as bottom border
            width: Ti.UI.FILL, height: '1dp', 
            backgroundColor: tabBorderColor,
            zIndex: 2, bottom: 0
        });

    tabContainer.add(separator); 

    function openTab(_selectedTab){
        var selectedTab = _selectedTab;
        
        _.each(tabs, function(tab){
            if(tab.isOpen){
                tab.isOpen = false;
                if(this.closeAnimation) tabView.animate(this.closeAnimation);
            }
        });
        
        _.each(tabs, function(tab){
            if(tab.name == selectedTab.name){
                selectedTab.select();
                if(tab.controller){
                    var C = require(tab.controller);
                    var controller_view = new C(tab.args);
                    selectedTab.controller_view = controller_view;
                    tab.isOpen = true;
                    // do this after the previous tab is closed, hence the delay
                    setTimeout(function(){
                        tabView.removeAllChildren();
                        tabView.add(controller_view);
                        if(this.openAnimation) tabView.animate(this.openAnimation);
                    }, 250);
                }
            } else {
                tab.deselect();
            };
        });
    }

    function _createTab(tabItem){
        var borderTop = Ti.UI.createView({
                height: '1dp', width: tabWidth, top:'0dp',
                backgroundColor: tabBorderColor, visible: false
            }), 
            borderLeft = Ti.UI.createView({
                height: tabHeight, width: '1dp', left: '0dp',
                backgroundColor: tabBorderColor, visible: false
            }),
            borderRight = Ti.UI.createView({
                height: tabHeight, width: '1dp', right: '0dp',
                backgroundColor: tabBorderColor, visible: false
            }),
            tabLabel = Ti.UI.createLabel({
                text: tabItem.name, color: lightLabelColor,
                font:{ fontFamily:'Roboto', fontSize: 14, },
                touchEnabled: false
            }),
            tab = Ti.UI.createView({
                width: tabWidth, height: tabHeight,
                left: parseInt(prevX + spacer) + 'dp',
                backgroundColor: tabBackgroundColor,
                zIndex: 1,  isOpen: false,
                select: function(){
                    this.animate({
                        zIndex: 3,
                        backgroundColor: selectedBackgroundColor,
                        duration: 5
                    });
                    borderTop.setVisible(true);
                    borderLeft.setVisible(true);
                    borderRight.setVisible(true);
                    tabLabel.setColor(darkLabelColor);
                },
                deselect: function(){
                    this.setBackgroundColor(tabBackgroundColor);
                    this.setZIndex(1);
                    borderTop.setVisible(false);
                    borderLeft.setVisible(false);
                    borderRight.setVisible(false);
                    tabLabel.setColor(lightLabelColor);
                },
                name: tabItem.name, 
                controller: tabItem.controller,
                args: tabItem.args,
                openByDefault: false,
                controller_view: undefined
            });

        prevX = prevX + spacer + increments;
        tab.add(borderLeft); tab.add(borderTop); tab.add(borderRight);
        tab.add(tabLabel);
        tab.addEventListener('click', function(e){
            openTab(e.source);
        });
        return tab;
    };
    
    function openDefault(){
        _.each(tabs, function(tab){
            if(tab.openByDefault){
                openTab(tab);
            };
        });
    }

    // public functions
    return {
        _createTab: _createTab,
        openDefault: openDefault,
        addTab: function(tabItem) {
            var tab = this._createTab(tabItem);
            tabContainer.add(tab);
            tabs.push(tab);
            if(tabItem.openByDefault){
                tab.openByDefault = true;
                openTab(tab);
            }
        },
        getTabs: function(){
            return tabContainer;
        },
        setTabView: function(view){
            tabView = view;
        }
    }
}

module.exports = Tabs;
