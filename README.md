# recucu
Reusable cucumber steps
## Requirements:
Node.js 10.3.x+
## Supported Operation Systems:
MacOS, Linux, Windows
## How to use:
Clone recucu in your project directory.<br/>
Create 2 default directories on one level up outside of recucu:
- For reusable parts - **feature_parts**
- For initial files to start generation - **feature_sources**<br/>

Create recucu.json file on one level up outside of recucu with empty object:
<code>\{\}</code><br/>

Reusable feature files store steps to insert into initial files.<br/>
Initial files may contain steps with specific pattern to make replacement after generation:<br/>
<code>When user is running steps from <scenario_name> in <feature_file_name></code><br/>
  
Run with command:<br/>
<code>node --harmony ./recucu/index.js</code><br/>

## Options:
Add properties and values to <code>recucu.json</code>. Supported [JSON5](https://json5.org/) syntax - JSON for humans.
### main_path
Path to feature_parts, feature_sources and result of generation. **Default:** any directory one level up from recucu.
### featurepart_path
Path to feature_parts. **Default:** directory **feature_parts** one level up from recucu.
### featuresource_path
Path to **feature_sources**. **Default:** directory **feature_sources** one level up from recucu.
