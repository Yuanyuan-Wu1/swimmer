const WestTeamAuthService = require('../services/westTeamAuth');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

async function getApiKey() {
  try {
    // 1. 提示输入凭据
    const credentials = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Enter West Swim Team username:'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter password:'
      }
    ]);

    console.log('Attempting to get API key...');
    
    // 2. 尝试不同的方法获取API Key
    let apiKey;
    
    try {
      console.log('Trying direct API method...');
      apiKey = await WestTeamAuthService.getApiKeyDirect(
        credentials.username, 
        credentials.password
      );
    } catch (error) {
      console.log('Direct method failed, trying browser method...');
      apiKey = await WestTeamAuthService.getApiKeyFromLogin(
        credentials.username, 
        credentials.password
      );
    }

    if (!apiKey) {
      console.log('Could not get API key automatically. Trying network analysis...');
      const requests = await WestTeamAuthService.getApiKeyFromNetwork();
      console.log('Please check the browser window and copy the API key from the network requests.');
      
      // 提示手动输入
      const { manualApiKey } = await inquirer.prompt([
        {
          type: 'input',
          name: 'manualApiKey',
          message: 'Please enter the API key from the browser:'
        }
      ]);
      
      apiKey = manualApiKey;
    }

    // 3. 验证API Key
    console.log('Validating API key...');
    const isValid = await WestTeamAuthService.validateApiKey(apiKey);
    
    if (!isValid) {
      throw new Error('Invalid API key');
    }

    // 4. 保存到环境文件
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = `WEST_TEAM_API_KEY=${apiKey}\n`;
    
    fs.writeFileSync(envPath, envContent, { flag: 'a' });
    
    console.log('API key has been saved to .env file');
    
    return apiKey;
  } catch (error) {
    console.error('Error getting API key:', error);
    throw error;
  }
}

// 运行脚本
if (require.main === module) {
  getApiKey()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = getApiKey; 