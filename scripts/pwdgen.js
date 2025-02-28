#!/usr/bin/env node

const readline = require('readline');

class PasswordGenerator {
  constructor() {
    this.lowercase = 'abcdefghijklmnopqrstuvwxyz';
    this.uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.numbers = '0123456789';
    this.symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    this.similar = 'iIlL1oO0';
    this.ambiguous = '{}[]()/\\\'"`~,;:.<>';
  }

  generate(options) {
    const {
      length = 12,
      includeLowercase = true,
      includeUppercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = false,
      excludeAmbiguous = false,
      requireAll = true,
      maxConsecutive = 0
    } = options;

    // Create character pool based on options
    let pool = '';
    if (includeLowercase) pool += this.lowercase;
    if (includeUppercase) pool += this.uppercase;
    if (includeNumbers) pool += this.numbers;
    if (includeSymbols) pool += this.symbols;

    // Remove excluded characters
    if (excludeSimilar) {
      for (const char of this.similar) {
        pool = pool.replace(new RegExp(char, 'g'), '');
      }
    }
    if (excludeAmbiguous) {
      for (const char of this.ambiguous) {
        pool = pool.replace(new RegExp('\\' + char, 'g'), '');
      }
    }

    if (pool.length === 0) {
      return 'Error: No characters available with current settings';
    }

    // Generate password
    let password = '';
    const minCategories = requireAll ? 
      (includeLowercase + includeUppercase + includeNumbers + includeSymbols) : 1;
    
    // Keep generating until all requirements are met
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      password = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        password += pool[randomIndex];
      }

      // Check if all required character types are included
      if (requireAll) {
        const hasLower = includeLowercase ? /[a-z]/.test(password) : true;
        const hasUpper = includeUppercase ? /[A-Z]/.test(password) : true;
        const hasNumber = includeNumbers ? /[0-9]/.test(password) : true;
        const hasSymbol = includeSymbols ? new RegExp(`[${this.symbols.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(password) : true;
        
        if (!hasLower || !hasUpper || !hasNumber || !hasSymbol) {
          attempts++;
          continue;
        }
      }
      
      // Check maximum consecutive characters
      if (maxConsecutive > 0) {
        let maxFound = 1;
        let currentRun = 1;
        
        for (let i = 1; i < password.length; i++) {
          if (password[i] === password[i-1]) {
            currentRun++;
            maxFound = Math.max(maxFound, currentRun);
          } else {
            currentRun = 1;
          }
        }
        
        if (maxFound > maxConsecutive) {
          attempts++;
          continue;
        }
      }
      
      break;
    }
    
    if (attempts >= maxAttempts) {
      return 'Error: Could not generate password meeting all criteria. Try relaxing some requirements.';
    }
    
    return password;
  }

  // Method to validate the strength of a password
  checkStrength(password) {
    const length = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = new RegExp(`[${this.symbols.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(password);
    
    const charTypes = hasLower + hasUpper + hasNumber + hasSymbol;
    
    let strength = 'Weak';
    let score = 0;
    
    // Length contributes to score
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    
    // Character variety contributes to score
    score += charTypes;
    
    // Penalize patterns
    if (/(.)\1\1/.test(password)) score -= 1; // Repeated characters
    if (/^[a-zA-Z]+$/.test(password)) score -= 1; // Only letters
    if (/^[0-9]+$/.test(password)) score -= 1; // Only numbers
    
    // Determine strength based on score
    if (score >= 6) strength = 'Very Strong';
    else if (score >= 4) strength = 'Strong';
    else if (score >= 2) strength = 'Moderate';
    
    return {
      strength,
      score,
      details: {
        length,
        hasLowercase: hasLower,
        hasUppercase: hasUpper,
        hasNumbers: hasNumber,
        hasSymbols: hasSymbol,
        charTypes
      }
    };
  }
}

// Main CLI application
function printHelp() {
  console.log(`
Password Generator CLI

Usage:
  pwgen [options]

Options:
  -l, --length <number>          Password length (default: 12)
  -L, --no-lowercase             Exclude lowercase letters
  -U, --no-uppercase             Exclude uppercase letters
  -N, --no-numbers               Exclude numbers
  -S, --no-symbols               Exclude symbols
  --exclude-similar              Exclude similar characters (i, I, l, L, 1, o, O, 0)
  --exclude-ambiguous            Exclude ambiguous characters ({}, [], (), etc.)
  --allow-incomplete             Don't require all character types
  --max-consecutive <number>     Maximum consecutive identical characters
  -n, --count <number>           Number of passwords to generate (default: 1)
  -i, --interactive              Start interactive mode
  -h, --help                     Display help

Interactive mode commands:
  generate                       Generate a new password with current settings
  set <option> <value>           Change a setting
  show                           Show current settings
  check <password>               Check password strength
  help                           Show help
  exit                           Exit the program
`);
}

function parseArgs(args) {
  const options = {
    length: 12,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    requireAll: true,
    maxConsecutive: 0,
    count: 1,
    interactive: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-l':
      case '--length':
        options.length = parseInt(args[++i]) || 12;
        break;
      case '-L':
      case '--no-lowercase':
        options.includeLowercase = false;
        break;
      case '-U':
      case '--no-uppercase':
        options.includeUppercase = false;
        break;
      case '-N':
      case '--no-numbers':
        options.includeNumbers = false;
        break;
      case '-S':
      case '--no-symbols':
        options.includeSymbols = false;
        break;
      case '--exclude-similar':
        options.excludeSimilar = true;
        break;
      case '--exclude-ambiguous':
        options.excludeAmbiguous = true;
        break;
      case '--allow-incomplete':
        options.requireAll = false;
        break;
      case '--max-consecutive':
        options.maxConsecutive = parseInt(args[++i]) || 0;
        break;
      case '-n':
      case '--count':
        options.count = parseInt(args[++i]) || 1;
        break;
      case '-i':
      case '--interactive':
        options.interactive = true;
        break;
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }
  
  return options;
}

// Interactive mode
function startInteractive(generator, options) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'pwgen> '
  });

  console.log('Password Generator Interactive Mode');
  console.log('Type "help" for available commands');
  rl.prompt();

  rl.on('line', (line) => {
    const args = line.trim().split(/\s+/);
    const command = args[0].toLowerCase();

    switch (command) {
      case 'generate':
        console.log(generator.generate(options));
        break;
      
      case 'set':
        if (args.length < 3) {
          console.log('Usage: set <option> <value>');
          break;
        }
        const option = args[1];
        const value = args[2];
        
        switch (option) {
          case 'length':
            options.length = parseInt(value) || 12;
            break;
          case 'lowercase':
            options.includeLowercase = value === 'true';
            break;
          case 'uppercase':
            options.includeUppercase = value === 'true';
            break;
          case 'numbers':
            options.includeNumbers = value === 'true';
            break;
          case 'symbols':
            options.includeSymbols = value === 'true';
            break;
          case 'exclude-similar':
            options.excludeSimilar = value === 'true';
            break;
          case 'exclude-ambiguous':
            options.excludeAmbiguous = value === 'true';
            break;
          case 'require-all':
            options.requireAll = value === 'true';
            break;
          case 'max-consecutive':
            options.maxConsecutive = parseInt(value) || 0;
            break;
          case 'count':
            options.count = parseInt(value) || 1;
            break;
          default:
            console.log(`Unknown option: ${option}`);
        }
        console.log(`Set ${option} to ${value}`);
        break;
      
      case 'show':
        console.log('Current settings:');
        console.log(JSON.stringify(options, null, 2));
        break;
      
      case 'check':
        if (args.length < 2) {
          console.log('Usage: check <password>');
          break;
        }
        const password = args[1];
        const strength = generator.checkStrength(password);
        console.log(`Strength: ${strength.strength} (score: ${strength.score})`);
        console.log('Details:', JSON.stringify(strength.details, null, 2));
        break;
      
      case 'help':
        console.log(`
Available commands:
  generate                       Generate a new password with current settings
  set <option> <value>           Change a setting
  show                           Show current settings
  check <password>               Check password strength
  help                           Show help
  exit                           Exit the program

Options to set:
  length                         Password length (number)
  lowercase                      Include lowercase (true/false)
  uppercase                      Include uppercase (true/false)
  numbers                        Include numbers (true/false)
  symbols                        Include symbols (true/false)
  exclude-similar                Exclude similar characters (true/false)
  exclude-ambiguous              Exclude ambiguous characters (true/false)
  require-all                    Require all character types (true/false)
  max-consecutive                Maximum consecutive identical characters (number)
  count                          Number of passwords to generate (number)
`);
        break;
      
      case 'exit':
      case 'quit':
        rl.close();
        return;
      
      default:
        console.log(`Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }
    
    rl.prompt();
  }).on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
  });
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  const generator = new PasswordGenerator();
  
  if (options.interactive) {
    startInteractive(generator, options);
  } else {
    for (let i = 0; i < options.count; i++) {
      console.log(generator.generate(options));
    }
  }
}

main();
