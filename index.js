'use strict';
//Modules
const path = require('path');
const JSON5 = require('json5');
const fse = require('fs-extra');
const fs = require('fs');
const pkgDir = require('pkg-dir');
const app_root_string = pkgDir.sync();
//Main
const {Feature_file_generator} = require('./src/feature_generator/core');

async function run_generation() {
    let settings_path = path.join(app_root_string, '../recucu.json');
    let settings_str = fs.readFileSync(settings_path, 'utf-8');
    let {featuresource_path, featurepart_path, main_path} = JSON5.parse(settings_str);

    if (main_path == null || main_path === '') main_path = path.join(app_root_string, '../');

    let feature_file_generator = new Feature_file_generator(main_path);

    (featuresource_path == null || featuresource_path === '')
        ? featuresource_path = path.join(app_root_string, '../feature_sources')
        : featuresource_path = path.join(app_root_string, '../', featuresource_path);

    (featurepart_path == null || featurepart_path === '')
        ? featurepart_path = path.join(app_root_string, '../feature_sources')
        : featurepart_path = path.join(app_root_string, '../', featurepart_path);
		
	console.log(`main_path: ${main_path}`);
	console.log(`featuresource_path: ${featuresource_path}`);
	console.log(`featurepart_path: ${featurepart_path}`);

    await feature_file_generator.gen_features({
        featuresource_path,
        featurepart_path,
    });
}

run_generation();

