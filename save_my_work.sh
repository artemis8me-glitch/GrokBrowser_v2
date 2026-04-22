#!/bin/bash
# Antigravity Backup Protocol - "Save My Work"
# Automates exporting the Empire Backup to SD Card or Network Tablet

BACKUP_FILE="/home/devlopjake/empire_backup_FINAL.tar.gz"
echo -e "\033[1;36mInitializing Backup Transfer Protocol...\033[0m"
echo "Payload: $BACKUP_FILE"
echo "Size: $(du -h $BACKUP_FILE | cut -f1)"

echo ""
echo -e "\033[1;33m[OPTION 1] Transfer to SD Card / USB Drive\033[0m"
echo -e "\033[1;33m[OPTION 2] Transfer to Tablet via Network (SCP)\033[0m"
read -p "Select Mode (1 or 2): " MODE

if [ "$MODE" == "1" ]; then
    echo ""
    echo "Scanning for removable drives..."
    # List actual disks, exclude loop/snap
    lsblk -p -o NAME,SIZE,TYPE,MOUNTPOINT | grep -v "loop" | grep -v "nvme0n1p" | grep -v "rom"
    
    echo ""
    echo -e "\033[1;31mIMPORTANT: If your SD card is not listed above, unplug it and plug it back in, then run this script again.\033[0m"
    echo "If you see it (e.g., /dev/sda1 or /dev/mmcblk0p1), type the name below."
    read -p "Enter Device Name (or 'exit'): " DEVICE

    if [ "$DEVICE" == "exit" ]; then exit; fi

    # Check if mounted
    MOUNTED=$(lsblk -n -o MOUNTPOINT $DEVICE)
    
    if [ -z "$MOUNTED" ]; then
        echo "Device not mounted. Mounting to /mnt/empire_backup..."
        sudo mkdir -p /mnt/empire_backup
        sudo mount $DEVICE /mnt/empire_backup
        TARGET="/mnt/empire_backup"
        WAS_MOUNTED=0
    else
        echo "Device already mounted at $MOUNTED"
        TARGET="$MOUNTED"
        WAS_MOUNTED=1
    fi

    echo "Copying backup to $TARGET..."
    sudo cp -v $BACKUP_FILE $TARGET/
    sync

    if [ $? -eq 0 ]; then
        echo -e "\033[1;32m[SUCCESS] Backup secured on SD Card.\033[0m"
        if [ $WAS_MOUNTED -eq 0 ]; then
            sudo umount $TARGET
            echo "Device unmounted. Safe to remove."
        fi
    else
        echo -e "\033[1;31m[ERROR] Copy failed.\033[0m"
    fi

elif [ "$MODE" == "2" ]; then
    echo ""
    read -p "Enter Tablet IP (e.g. 192.168.1.10): " IP
    read -p "Enter Username (e.g. devops): " USER
    
    echo "Initiating SCP transfer..."
    scp $BACKUP_FILE $USER@$IP:~/
    
    if [ $? -eq 0 ]; then
        echo -e "\033[1;32m[SUCCESS] Backup transferred to Tablet ($IP).\033[0m"
    else
        echo -e "\033[1;31m[ERROR] Network transfer failed. Check IP/SSH keys.\033[0m"
    fi
else
    echo "Invalid selection."
fi
