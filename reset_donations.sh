#!/bin/bash
# Utonga Sanctuary - Reset Test Donation Data Script
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/backend"

echo "======================================================"
echo " Utonga Sanctuary - Reset Test Donation Data"
echo "======================================================"

python manage.py reset_donations "$@"
