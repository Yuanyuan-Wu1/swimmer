const WestTeamAuthService = require('../services/westTeamAuth');
const fs = require('fs');
const path = require('path');

async function debugAuth() {
  try {
    const service = new WestTeamAuthService();
    console.log('Starting authentication analysis...');

    // 获取认证信息
    const authInfo = await service.getApiKeyFromNetwork();
    
    // 保存认证信息
    const configPath = path.join(__dirname, '..', 'config', 'auth.json');
    fs.writeFileSync(configPath, JSON.stringify(authInfo, null, 2));

    console.log('\nAuth info saved to:', configPath);
    console.log('\nPlease add these headers to your requests:');
    console.log(authInfo.headers);
    console.log('\nAnd these cookies:');
    console.log(authInfo.cookies);

    // 测试认证
    try {
      const meetResults = await service.getMeetResults();
      console.log('\nSuccessfully retrieved meet results!');
      return true;
    } catch (error) {
      console.log('\nFailed to get meet results. Please check the saved auth info.');
      return false;
    }
  } catch (error) {
    console.error('Debug session failed:', error);
    return false;
  }
}

// 运行调试
if (require.main === module) {
  debugAuth().then(success => {
    process.exit(success ? 0 : 1);
  });
} 