module.exports = {
    transpileDependencies: ['vuetify'],
    pluginOptions: {
        electronBuilder: {
            //https://stackoverflow.com/questions/62777834/how-fix-dirname-not-defined-when-using-electron-events-with-vue
            nodeIntegration: true,
            builderOptions: {
                //database location
                //https://github.com/knex/knex/issues/3727
                extraResources: ['src/res/'],
					appId: "ch.lionelkarlen.openjur",
					productName: "OpenJUR",
					win: {
						"target": "nsis",
						"icon": "src/assets/icon.ico"
					},
					nsis: {
						"allowToChangeInstallationDirectory": true,
						"oneClick": false
					},
            },
            externals: ['knex', 'sqlite3'],
        },
    },
};
