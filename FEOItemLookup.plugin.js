/**
 * @name Placeholder
 * @author Soap#0027
 * @version 0.0.1
 * @description testing how plugins work
 */

 const config = {
	"info": {
		"name": "FEO Item Lookup",
		"authors": [{
			"name": "Soap",
			"discord_id": "311160994485239809",
			"github_username": "SeasonalSourcream"
		}],
		"version": "0.0.1",
		"description": "Display a Fire Emblem Online weapon stat block. Select a weapon, right click and press FEO Item Lookup to see its stat block!",
	},
	
}

module.exports = !global.ZeresPluginLibrary ? class {
    constructor() {this._config = config }
        getName() { return config.info.name }
        getAuthor() { return config.info.authors.map(a => a.name).join(", ") }
        getDescription() { return config.info.description }
        getVersion() { return config.info.version }
        load() {
            //if dependencies aren't found, download them 
            //TODO: add download link for weapons json.
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for **${config.info.name}** is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() { }
        stop() { }
} : (([Plugin, Library]) => {

    const customCSS = `
    .item-name {
		clear: left;
		color: var(--header-primary);
		font-size: 1.3em;
		text-align: center;
		font-weight: bold;
		text-decoration: underline;
	}
	.might {
		color: var(--text-normal);
		padding-bottom: 15px;
	}
    .hit {
		color: var(--text-normal);
		padding-bottom: 15px;
	}	
    .critical {
		color: var(--text-normal);
		padding-bottom: 15px;
	}
    .range {
		color: var(--text-normal);
		padding-bottom: 15px;
	}
    .weight {
		color: var(--text-normal);
		padding-bottom: 15px;
	}
    .uses {
		color: var(--text-normal);
		padding-bottom: 15px;
	}
    .rankwlvl {
		color: var(--text-normal);
		padding-bottom: 15px;
	}
    .cost {
		color: var(--text-normal);
		padding-bottom: 15px;
	}
    .wexp {
		color: var(--text-normal);
		padding-bottom: 15px;
	}
    .effect {
		color: var(--text-normal);
		padding-bottom: 15px;
	}

	.UrbanD-Image {
		float: left;
		margin-bottom: 30;
	}
	.Info-Wrapper {
		-webkit-user-select: text;
	}
	.StatBlock {
		background-color: var(--background-secondary);
		border-radius: 15px;
		padding: 10px;
		margin-top: 20px;
	}
    `
    const { Toasts, WebpackModules, DCM, Patcher, React, Settings,Logger } = { ...Library, ...BdApi };
    const { SettingPanel, Switch, Slider, RadioGroup } = Settings;

	const MessageContextMenu = lazyLoadingSmasher9000("MessageContextMenu");
	const SlateTextAreaContextMenu = lazyLoadingSmasher9000("SlateTextAreaContextMenu");

	//credits to Strencher
	function lazyLoadingSmasher9000(displayName) {
		return new Promise(resolve => {
			const cached = WebpackModules.getModule(m => m && m.default && m.default.displayName === displayName);
			if (cached) return resolve(cached);
			const unsubscribe = WebpackModules.addListener(module => {
			  if (!module.default || module.default.displayName !== displayName) return;
			  unsubscribe();
			  resolve(module);
			});
		  });
	}

    return class FEOTools extends Plugin {
		async onStart() {
			
			BdApi.injectCSS(config.info.name, customCSS)

			Patcher.after(config.info.name, await MessageContextMenu, "default", (_, __, ret) => {
				console.log(ret);
				ret.props.children.push(this.getContextMenuItem())
			})

			Patcher.after(config.info.name, await SlateTextAreaContextMenu, "default", (_, __, ret) => {
				ret.props.children.push(this.getContextMenuItem())
			})
		}
        
        getContextMenuItem() {
			let selection = window.getSelection().toString().trim();
			if (selection === "") { return; }
			let item = selection.charAt(0).toLocaleLowerCase() + selection.slice(1);
			let ContextMenuItem = DCM.buildMenuItem({
				label: "FEO Item Lookup",
				type: "text",
				action: () => {
					Logger.log(`Fetching "${item}"...`);
                    var items = require('./weapons.json')
                    var obj = items
                    for (var element in obj){
                        var itemName = obj[element].name.toLocaleLowerCase()
                        if(item = itemName){
                            this.processJson(item, obj[element])
							Logger.log(`"FEO weapon found: ${item}".`) 
						 }
                         else if ( item !== itemName ) {
                                BdApi.alert("No weapon found!", React.createElement("div", { class: "markdown-19oyJN paragraph-9M861H" }, `Couldn't find `, React.createElement("span", { style: { fontWeight: "bold" } }, `"${item}"`), ` in the FEO weapons list.`));//
                                return;
                         }
                    }
				
				}
			})
			return ContextMenuItem;
		}
        async processJson(e, info) {
            var items = require('./weapons.json')
            var obj = items
            let weaponsElement = []
            
                let type = obj[e].type
                let might = obj[e].might
                let hit = obj[e].hit
                let critical = obj[e].critical
                let range = obj[e].range
                let weight = obj[e].weight
                let uses = obj[e].uses
                let rankwlvl = obj[e].rankwlv
                let cost = obj[e].cost
                let wexp = obj[e].wexp
                let effect = obj[e].effect
            
            

            weaponsElement.push(React.createElement("div", { class: "StatBlock"},
            React.createElement("div", { class: "type" }, type ),
            React.createElement("div", { class: "might" }, might ),
            React.createElement("div", { class: "hit" }, hit ),
            React.createElement("div", { class: "critical" }, critical),
            React.createElement("div", { class: "range" }, range),
            React.createElement("div", { class: "weight" }, weight),
            React.createElement("div", { class: "uses" }, uses),
            React.createElement("div", { class: "rankwlvl" }, rankwlvl),
            React.createElement("div", { class: "cost" }, cost),
            React.createElement("div", { class: "wexp" }, wexp),
            React.createElement("div", { class: "effect" }, effect),
            // React.createElement("div", { class: "UrbanD-Info" },
            //     "Likes: ", React.createElement("span", { class: "UrbanD-Likes" }, likes),
            //     ", Dislikes: ", React.createElement("span", { class: "UrbanD-Likes" }, dislikes),
            //     ", written by ", React.createElement("span", { class: "UrbanD-Author" }, author)),
            // React.createElement("div", { class: "UrbanD-Date" }, date),
        ))
        BdApi.alert("",
				React.createElement("div", { class: "Info-Wrapper" },
					React.createElement("a", { href: "https://www.urbandictionary.com/", target: "_blank" }, 
                        React.createElement("img", { class: "UrbanD-Image", src: "https://raw.githubusercontent.com/TheGreenPig/BetterDiscordPlugins/main/UrbanDictionary/UD_logo.svg", width: "100" }),),

					React.createElement("a", { href: `https://www.google.com/search?q=feo${e}`, target: "_blank" }, 
                        React.createElement("div", { class: "itemname" }, e)),
					weaponsElement
				)
			)
        }
        onStop() {
			BdApi.clearCSS(config.info.name)
			Patcher.unpatchAll(config.info.name);
		}

    }
})(global.ZeresPluginLibrary.buildPlugin(config));






    //load() {} //called when plugin is first loaded into memory

    //start(){}// required function. called when plugin is activated.
    // stop() {} // required function. called when plugin is deactivated.

    // observer(changes) {} //optional function. observer for the document

