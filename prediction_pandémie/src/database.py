import mysql.connector
from mysql.connector import errorcode


DATABASE_NAME = "original_pan"

def get_database_connection(database_name=None):
    """
    Crée une connexion à la base de données MySQL.
    Si `database_name` est spécifié, connecte à cette base de données.
    """
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",  
            password="",  
            database=database_name
        )
        return connection
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Erreur : Nom d'utilisateur ou mot de passe incorrect.")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print(f"Erreur : La base de données '{database_name}' n'existe pas.")
        else:
            print(f"Erreur : {err}")
        raise

def create_database_if_not_exists(cursor, database_name):
    """
    Crée une base de données MySQL si elle n'existe pas.
    """
    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
        print(f"Base de données '{database_name}' vérifiée/créée avec succès.")
    except mysql.connector.Error as err:
        print(f"Erreur lors de la création de la base de données : {err}")

def create_table(cursor, table_name, columns):
    """
    Crée une table MySQL si elle n'existe pas déjà.
    """
    columns_definitions = ', '.join([f"{col} {dtype}" for col, dtype in columns.items()])
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS {table_name} (
        {columns_definitions}
    );
    """
    cursor.execute(create_table_query)

def save_to_database(df, table_name, connection):
    """
    Sauvegarde un DataFrame dans une table MySQL.
    """
    cursor = connection.cursor()
    cursor.execute(f"TRUNCATE TABLE {table_name}")  
    for _, row in df.iterrows():
        placeholders = ', '.join(['%s'] * len(row))
        columns = ', '.join(row.index)
        sql = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
        cursor.execute(sql, tuple(row))
    connection.commit()