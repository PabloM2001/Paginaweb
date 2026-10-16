# Punto de entrada para cPanel ("Setup Python App" usa Passenger y busca la variable "application")
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from servidor_correo import app as application  # noqa: E402
