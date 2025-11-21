import pandas as pd
import os

# Ruta al archivo Excel
file_path = r'c:\Users\nav\Desktop\ERM\3_DEV\verifricar_dni\docs\SCTR MOVIEMBRE.xlsx'

# Verificar si el archivo existe
if not os.path.exists(file_path):
    print(f"Error: No se encontró el archivo en la ruta: {file_path}")
    exit(1)

try:
    # Leer el archivo Excel
    print(f"Analizando el archivo: {file_path}")
    
    # Obtener los nombres de las hojas
    xl = pd.ExcelFile(file_path)
    print("\nHojas en el archivo:", xl.sheet_names)
    
    # Leer la primera hoja (o la hoja activa)
    df = pd.read_excel(file_path, sheet_name=0)
    
    # Mostrar información general
    print("\n=== INFORMACIÓN GENERAL ===")
    print(f"Número de filas: {len(df)}")
    print(f"Número de columnas: {len(df.columns)}")
    
    # Mostrar las primeras 5 filas
    print("\n=== PRIMERAS 5 FILAS ===")
    print(df.head().to_string())
    
    # Mostrar nombres de columnas
    print("\n=== COLUMNAS ===")
    for i, col in enumerate(df.columns, 1):
        print(f"{i}. {col}")
    
    # Mostrar información de tipos de datos
    print("\n=== TIPOS DE DATOS ===")
    print(df.dtypes)
    
    # Mostrar valores únicos en columnas con pocos valores únicos
    print("\n=== VALORES ÚNICOS EN COLUMNAS ===")
    for col in df.columns:
        unique_vals = df[col].nunique()
        if unique_vals <= 10:  # Mostrar columnas con 10 o menos valores únicos
            print(f"\nColumna: {col}")
            print(f"Valores únicos: {unique_vals}")
            print("Valores:", df[col].unique())
    
    # Verificar valores nulos
    print("\n=== VALORES NULOS ===")
    print(df.isnull().sum())
    
    # Mostrar estadísticas descriptivas para columnas numéricas
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    if not numeric_cols.empty:
        print("\n=== ESTADÍSTICAS DESCRIPTIVAS ===")
        print(df[numeric_cols].describe())
    
except Exception as e:
    print(f"\nError al analizar el archivo: {str(e)}")
