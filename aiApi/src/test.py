from data_preprocessing import load_data
from database import get_database_connection, DATABASE_NAME
from model import PandemicPredictor
import pandas as pd

def test_load_data():
    """
    Teste la fonction load_data pour vérifier si :
    - La base de données est créée si elle n'existe pas.
    - Les fichiers CSV sont bien sauvegardés dans les tables.
    """
    try:
        
        corona_df, variole_df, location_df = load_data()

       
        connection = get_database_connection(DATABASE_NAME)
        cursor = connection.cursor()

        
        cursor.execute("SELECT COUNT(*) FROM corona_original;")
        result = cursor.fetchone()
        if result is not None:
            corona_count = result[0] if isinstance(result, (tuple, list)) else None
            print(f"Nombre de lignes dans la table corona_original : {corona_count}")
        else:
            print("Aucune donnée trouvée dans la table corona_original.")

        
        cursor.execute("SELECT COUNT(*) FROM variole_original;")
        result = cursor.fetchone()
        if result is not None:
            variole_count = result[0] if isinstance(result, (tuple, list)) else None
            print(f"Nombre de lignes dans la table variole_original : {variole_count}")
        else:
            print("Aucune donnée trouvée dans la table variole_original.")

        
        print("\nAperçu des données chargées dans corona_df :")
        print(corona_df.head())

        print("\nAperçu des données chargées dans variole_df :")
        print(variole_df.head())

        print("\nAperçu des données chargées dans location_df :")
        print(location_df.head())

        connection.close()
    except Exception as e:
        print(f"Erreur lors du test de load_data : {e}")

def test_prediction():
    """
    Teste la prédiction avec un modèle entraîné.
    """
    
    test_data = pd.DataFrame({
        "year": [2025, 2025, 2025, 2025, 2025, 2025, 2025, 2025, 2025, 2025],
        "month": [4, 5, 6, 7, 8, 9, 10, 11, 12, 1],
        "cumulative_total_cases": [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800],
        "active_cases": [200, 250, 300, 350, 400, 450, 500, 550, 600, 650],
        "new_cases": [50, 60, 70, 80, 90, 100, 110, 120, 130, 140]
    })

   
    predictor = PandemicPredictor()
    predictor.train(test_data)

   
    prediction = predictor.predict(pd.DataFrame(
        [[2025, 4, 1000, 200]],
        columns=["year", "month", "cumulative_total_cases", "active_cases"]
    ))
    print(f"Prédiction : {prediction}")





