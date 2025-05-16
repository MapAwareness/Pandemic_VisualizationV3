import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from datetime import datetime
from database import (
    get_database_connection,
    create_database_if_not_exists,
    create_table,
    save_to_database,
    DATABASE_NAME
)

def encode_cyclical_feature(value, max_value):
    """
    Encode une caractéristique cyclique en utilisant les fonctions sinus et cosinus.
    """
    angle = 2 * np.pi * value / max_value
    return np.sin(angle), np.cos(angle)

def load_data():
    """
    Charge les données depuis des fichiers CSV, les insère dans une base de données,
    et retourne les DataFrames correspondants.
    """
    
    connection = get_database_connection()
    cursor = connection.cursor()

    
    create_database_if_not_exists(cursor, DATABASE_NAME)


    connection.close()

    
    connection = get_database_connection(DATABASE_NAME)
    cursor = connection.cursor()

    
    base_dir = os.path.dirname(os.path.dirname(__file__))
    corona_path = os.path.join(base_dir, 'data', 'corona.csv')
    variole_path = os.path.join(base_dir, 'data', 'variole.csv')
    location_path = os.path.join(base_dir, 'data', 'localisation.csv')

    
    corona_df = pd.read_csv(corona_path)
    variole_df = pd.read_csv(variole_path)
    location_df = pd.read_csv(location_path)

    
    corona_df = corona_df.fillna(0)  
    variole_df = variole_df.fillna(0)
    location_df = location_df.fillna('')
    
   
    def create_table_from_csv(cursor, table_name, df):
        columns = ', '.join([f"{col} FLOAT" if df[col].dtype in ['float64', 'int64'] else f"{col} VARCHAR(255)" for col in df.columns])
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {table_name} (
            {columns}
        );
        """
        cursor.execute(create_table_query)

   
    create_table_from_csv(cursor, "corona_original", corona_df)
    create_table_from_csv(cursor, "variole_original", variole_df)

 
    save_to_database(corona_df, "corona_original", connection)
    save_to_database(variole_df, "variole_original", connection)

   
    connection.close()

  
    variole_df = variole_df[['location', 'date', 'total_cases', 'total_deaths', 'new_cases', 'new_deaths']]
    variole_df.rename(columns={'location': 'country'}, inplace=True)
    variole_df = variole_df[variole_df['country'] != 'Africa']
    corona_df['date'] = pd.to_datetime(corona_df['date'])
    variole_df['date'] = pd.to_datetime(variole_df['date'])

    return corona_df, variole_df, location_df

def preprocess_data():
    """
    Prétraite les données pour les modèles de prédiction.
    """
    corona_df, variole_df, location_df = load_data()

    
    corona_with_continent = corona_df.merge(location_df, on='country', how='left')
    variole_with_continent = variole_df.merge(location_df, on='country', how='left')

 
    corona_with_continent = corona_with_continent.fillna(0)
    variole_with_continent = variole_with_continent.fillna(0)


    corona_with_continent['year'] = corona_with_continent['date'].dt.year
    corona_with_continent['month'] = corona_with_continent['date'].dt.month
    corona_with_continent['month_sin'], corona_with_continent['month_cos'] = zip(
        *corona_with_continent['month'].apply(lambda x: encode_cyclical_feature(x, 12))
    )

    variole_with_continent['year'] = variole_with_continent['date'].dt.year
    variole_with_continent['month'] = variole_with_continent['date'].dt.month
    variole_with_continent['month_sin'], variole_with_continent['month_cos'] = zip(
        *variole_with_continent['month'].apply(lambda x: encode_cyclical_feature(x, 12))
    )


    corona_with_continent['date'] = corona_with_continent['date'].astype(str)
    variole_with_continent['date'] = variole_with_continent['date'].astype(str)

    return corona_with_continent, variole_with_continent
