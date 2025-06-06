from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

class PandemicPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        
    def prepare_features(self, df):
        features = ['year', 'month']
        if 'cumulative_total_cases' in df.columns:
            
            features.extend(['cumulative_total_cases', 'active_cases'])
        else:
            
            features.extend(['total_cases', 'new_cases', 'total_deaths', 'new_deaths'])
    
    
        return df[features]
    
    def prepare_target(self, df):
        if 'daily_new_cases' in df.columns:
            return df['daily_new_cases']
        return df['new_cases']
    
    def train(self, df):
        X = self.prepare_features(df)
        y = self.prepare_target(df)
        
        X = self.scaler.fit_transform(X)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        self.model.fit(X_train, y_train)
        
        score = self.model.score(X_test, y_test)
        return score
    
    def predict(self, features):
        features_scaled = self.scaler.transform(features)
        return self.model.predict(features_scaled)
