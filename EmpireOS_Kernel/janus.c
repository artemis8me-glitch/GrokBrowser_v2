#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/io.h>
#include <linux/kprobes.h>
#include <linux/notifier.h> // Required for the die notifier (page faults)
#include <linux/wait.h>     // Required for blocking read
#include <linux/sched.h>    // For task_struct

#define JANUS_DEVICE_NAME "janus"
#define SYNAPSE_DEVICE_NAME "synapse"
#define BUF_LEN 2048

// Device major numbers
static int janus_major;
static int synapse_major;

// Buffers
static char janus_cmd_buf[BUF_LEN];
static char synapse_event_buf[BUF_LEN];
static int synapse_event_len = 0;

// Synchronization for the Synapse device
static DECLARE_WAIT_QUEUE_HEAD(synapse_wait_queue);
static struct fasync_struct *synapse_async_queue;

// Forward declarations
static ssize_t janus_write(struct file *, const char __user *, size_t, loff_t *);
static ssize_t synapse_read(struct file *, char __user *, size_t, loff_t *);
static int fasync_helper(int fd, struct file *filp, int mode);

// File operations
static struct file_operations janus_fops = { .write = janus_write };
static struct file_operations synapse_fops = { .read = synapse_read, .fasync = fasync_helper };

// --- Synaptic Link: Page Fault Notifier ---
static int page_fault_notifier(struct notifier_block *nb, unsigned long val, void *data) {
    if (val == DIE_PAGE_FAULT) {
        struct die_args *args = (struct die_args *)data;
        // Format a JSON-like event string
        synapse_event_len = scnprintf(synapse_event_buf, BUF_LEN,
            "{\"event\":\"PAGE_FAULT\", \"ip\":\"0x%lx\", \"address\":\"0x%lx\", \"error_code\":\"0x%lx\"}\n",
            args->regs->ip, args->err, args->trapnr);
        
        // Wake up any process waiting to read from /dev/synapse
        wake_up_interruptible(&synapse_wait_queue);
        // Send signal for non-blocking I/O
        kill_fasync(&synapse_async_queue, SIGIO, POLL_IN);
    }
    return NOTIFY_OK;
}

static struct notifier_block page_fault_nb = {
    .notifier_call = page_fault_notifier,
};

// --- Helper for FASYNC ---
static int fasync_helper(int fd, struct file *filp, int mode) {
    return fasync_helper(fd, filp, mode, &synapse_async_queue);
}

// --- Janus Device: Command Handler ---
static ssize_t janus_write(struct file *filp, const char __user *buff, size_t len, loff_t *off) {
    unsigned long address, length;
    void (*func_ptr)(void); // Function pointer for EXECUTE

    if (len >= BUF_LEN) return -EINVAL;
    if (copy_from_user(janus_cmd_buf, buff, len)) return -EFAULT;
    janus_cmd_buf[len] = '\0';

    if (sscanf(janus_cmd_buf, "PEEK(%lx, %lu)", &address, &length) == 2) {
        // PEEK is now handled via direct memory mapping from Python for speed.
        // This command is now a placeholder.
        printk(KERN_INFO "Janus: PEEK command received (handled in userspace).\n");
    } 
    else if (sscanf(janus_cmd_buf, "POKE(%lx, %lu)", &address, &length) == 2) {
        char *data_start = strchr(janus_cmd_buf, '\n');
        if (data_start && (len - (data_start - janus_cmd_buf + 1)) == length) {
            void __iomem *virt_addr = phys_to_virt(address);
            printk(KERN_ALERT "Janus: POKING %lu bytes to physical address 0x%lx\n", length, address);
            memcpy_toio(virt_addr, data_start + 1, length);
        }
    }
    else if (sscanf(janus_cmd_buf, "EXECUTE(%lx)", &address) == 1) {
        printk(KERN_ALERT "Janus: EXECUTING code at physical address 0x%lx\n", address);
        func_ptr = (void (*)(void))phys_to_virt(address);
        func_ptr();
    }
    return len;
}

// --- Synapse Device: Event Reader ---
static ssize_t synapse_read(struct file *filp, char __user *buff, size_t len, loff_t *off) {
    // Wait until there is a new event
    wait_event_interruptible(synapse_wait_queue, synapse_event_len > 0);
    
    if (len < synapse_event_len) return -EINVAL;
    if (copy_to_user(buff, synapse_event_buf, synapse_event_len)) return -EFAULT;
    
    ssize_t sent_len = synapse_event_len;
    synapse_event_len = 0; // Reset after reading
    return sent_len;
}

// --- Module Initialization and Cleanup ---
int init_module(void) {
    janus_major = register_chrdev(0, JANUS_DEVICE_NAME, &janus_fops);
    synapse_major = register_chrdev(0, SYNAPSE_DEVICE_NAME, &synapse_fops);
    register_die_notifier(&page_fault_nb); // Activate the Synaptic Link
    printk(KERN_INFO "Empire OS Kernel Interface: Janus and Synapse bridges loaded.\n");
    return 0;
}

void cleanup_module(void) {
    unregister_chrdev(janus_major, JANUS_DEVICE_NAME);
    unregister_chrdev(synapse_major, SYNAPSE_DEVICE_NAME);
    unregister_die_notifier(&page_fault_nb); // Deactivate the link
    printk(KERN_INFO "Empire OS Kernel Interface: Bridges unloaded.\n");
}

MODULE_LICENSE("GPL");
