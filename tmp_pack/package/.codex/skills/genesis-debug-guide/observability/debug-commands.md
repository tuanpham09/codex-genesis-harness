# Debug Commands by Language

Quick reference for debugging commands in different languages used in Genesis projects.

---

## Node.js / JavaScript

### Console Methods
```javascript
// Information
console.log('Message:', value);
console.info('Info message');
console.warn('Warning message');
console.error('Error message');

// Structured
console.table([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]);
console.dir(object);

// Timing
console.time('label');
// ... code ...
console.timeEnd('label');  // Outputs: label: 1234.56ms

// Assertions
console.assert(condition, 'Message if assertion fails');

// Trace
console.trace('Stack trace at this point');

// Groups
console.group('Group label');
console.log('...logs in group...');
console.groupEnd();
```

### Debugging CLI
```bash
# Run with Node inspector
node --inspect script.js
node --inspect-brk script.js  # Breaks on first line

# Run Jest with debugging
node --inspect-brk node_modules/.bin/jest --runInBand test.js

# Open Chrome DevTools: chrome://inspect
```

### Jest/Test Debugging
```javascript
test('example', () => {
  debugger;  // Browser debugger breakpoint (if using inspect)
  expect(value).toBe(expected);
});

// Skip a test
test.skip('should do something', () => {});

// Only run this test
test.only('should do something', () => {});

// Print all mocks
console.log(jest.fn.mock.calls);
```

---

## Python

### Print Debugging
```python
print(f"Value: {value}")
print(f"Type: {type(value)}")
print(f"Dict keys: {obj.__dict__}")

# Pretty print
import pprint
pprint.pprint(large_dict)

# JSON
import json
print(json.dumps(obj, indent=2))
```

### Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug('Debug message')
logger.info('Info message')
logger.warning('Warning message')
logger.error('Error message')

# With context
logger.info(f'Processing user {user_id}: {user.name}')
```

### Interactive Debugging
```python
# PDB - Python Debugger
import pdb
pdb.set_trace()  # Breakpoint - enters debugger here

# Or:
breakpoint()  # Python 3.7+

# IPython for interactive shell
from IPython import embed
embed()  # Opens interactive IPython shell
```

### Testing
```python
import unittest

# Skip test
@unittest.skip("Not implemented")
def test_something(self):
    pass

# Print test details
python -m pytest -v -s test.py  # -v verbose, -s show print statements
```

---

## PHP

### Echo/Print
```php
echo "Simple output";
print_r($array);         // For arrays/objects
var_dump($variable);     // Detailed dump with types
var_export($variable);   // Machine-readable format
```

### Error Reporting
```php
// Set error level
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log to file
error_log("Debug message", 3, "/tmp/debug.log");
```

### Debugging Tools
```php
// Xdebug extension (if installed)
var_dump($variable);  // With Xdebug: shows enhanced output

// Fire up debugger breakpoint
xdebug_break();

// Stack trace
debug_backtrace();
```

### Laravel Specific
```php
// Log helper
\Log::debug('Message', ['key' => $value]);
\Log::channel('single')->debug('Message');

// Dump and die
dd($variable);

// Dump without dying
dump($variable);
```

---

## Ruby

### Print Debugging
```ruby
puts "Message: #{value}"
p variable           # Inspect format (like Ruby console)
pp object            # Pretty print (requires 'pp')
```

### Debugging
```ruby
# Byebug debugger
require 'byebug'
byebug  # Breakpoint - enters debugger

# Pry (better interactive console)
require 'pry'
binding.pry  # Open Pry console here

# Interactive shell
irb  # Interactive Ruby shell
```

### Logging
```ruby
require 'logger'
logger = Logger.new(STDOUT)
logger.debug("Debug message")
logger.info("Info message")

# Rails logging
Rails.logger.debug("Message")
```

### Testing
```bash
# Run single test
ruby -I lib test/test_name.rb

# Run with debugging
ruby -r pry -I lib test/test_name.rb

# Rspec with debugging
rspec test_file.rb --format documentation
rspec test_file.rb -e "test name"  # Run specific test
```

---

## Go

### Logging
```go
import "log"

log.Println("Standard output")
log.Printf("Formatted: %v, %s", value, text)
log.Fatalf("Fatal error: %v", err)  // Prints and exits

// Structured logging (with external package)
import "github.com/sirupsen/logrus"
log.WithField("user_id", id).Debug("User action")
```

### Debugging
```go
// Delve debugger
import _ "net/http/pprof"

// Profiling
import "runtime/pprof"
```

### Testing
```bash
# Run tests with verbose output
go test -v ./...

# Run single test
go test -run TestName ./...

# Show coverage
go test -cover ./...

# Debug test with dlv
dlv test ./package -- -test.v -test.run TestName
```

---

## System / Performance Debugging

### Check System Load
```bash
# Unix/Linux/macOS
top                 # Real-time CPU/Memory usage
htop                # Better interface for top
ps aux              # List all processes
uptime              # System load average

# Network
netstat -tuln       # Listen ports
lsof -i :8000       # Processes using port 8000

# File I/O
iotop               # I/O by process
```

### Check Application Ports
```bash
# See if port is in use
lsof -i :3000
netstat -tulpn | grep 3000

# Kill process on port
kill -9 $(lsof -t -i :3000)
```

### Trace System Calls
```bash
# Linux
strace command      # Show system calls
strace -e trace=network command  # Network calls only

# macOS
dtruss command      # Similar to strace
```

---

## Browser DevTools

### Chrome/Edge DevTools
```javascript
// Keyboard shortcuts
F12 or Ctrl+Shift+I         // Open DevTools
Ctrl+Shift+J                // Console
Ctrl+Shift+C                // Element picker
Ctrl+Shift+M                // Device mode

// Console commands
console.log(...)
console.time('label')
console.assert(condition, 'message')
```

### Break on Error
```javascript
// Pause on all exceptions
DevTools → Sources → Pause on exceptions (icon with triangle)

// Break on specific line
DevTools → Sources → Click line number to set breakpoint

// Conditional breakpoint
Right-click line → Add conditional breakpoint → Condition
```

---

## Environment Inspection

### Check Environment
```bash
# Node.js
node -e "console.log(process.versions)"

# Python
python -c "import sys; print(sys.version)"

# Check installed packages
npm list                    # Node
pip list                    # Python
gem list                    # Ruby
```

### Debug Environment Variables
```bash
# Show all env vars
env | sort
echo $PATH

# Node.js
console.log(process.env.NODE_ENV)

# Python
import os
print(os.environ.get('DATABASE_URL'))
```
