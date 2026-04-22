from selenium import webdriver
import os

# Ensure Display is set for standard environments
if os.environ.get('DISPLAY') is None:
    os.environ['DISPLAY'] = ':0'

try:
    # For Chrome (Works out of the box with Selenium 4+)
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless') # Uncomment for headless
    driver_chrome = webdriver.Chrome(options=options)
    print("Chrome Driver Initialized Successfully.")
except Exception as e:
    print(f"Chrome Init Failed: {e}")

try:
    # For Firefox (Snap version fix)
    options = webdriver.FirefoxOptions()
    # Point to the actual binary if on Snap
    if os.path.exists("/snap/firefox/current/usr/lib/firefox/firefox"):
        options.binary_location = "/snap/firefox/current/usr/lib/firefox/firefox"
    
    driver_firefox = webdriver.Firefox(options=options)
    print("Firefox Driver Initialized Successfully.")
except Exception as e:
    print(f"Firefox Init Failed: {e}")
