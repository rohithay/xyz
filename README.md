# Usage

```
Usage:
  pwdgen [options]

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
```


```bash
# Interactive mode
./pwdgen.js -i
```

```bash
# Command line mode
./pwdgen.js -l 10
```


# Example
<img width="721" alt="Screenshot 2025-03-01 at 2 34 19 AM" src="https://github.com/user-attachments/assets/523c673a-5f35-47c2-b071-caf866b13330" />
