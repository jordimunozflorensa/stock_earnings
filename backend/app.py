from flask import Flask, request, jsonify
import yfinance as yf
from flask_cors import CORS
import pandas as pd
import csv
import colorama

app = Flask(__name__)
CORS(app)

def get_earnings_date(ticker):
    stock = yf.Ticker(ticker)
    cal = stock.calendar
    
    if isinstance(cal, dict):
        earnings_date = cal.get("Earnings Date")
    else:
        earnings_date = cal.loc["Earnings Date"][0] if "Earnings Date" in cal.index else None

    return earnings_date

@app.route('/api/earnings')
def earnings():
    """
    Query params: -
    Returns JSON: [ { ticker: str, date: 'YYYY-MM-DD' }, ... ]
    """
    tickers = []
    with open('../tickers.csv', 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            tickers.append(row['ticker'])
    result = []
    
    for ticker in tickers:
        print(f"Processing ticker: {ticker}")

        try:
            date = get_earnings_date(ticker)
            ddmmyyyy = date[0].strftime("%Y-%m-%d") if date else None
            if ddmmyyyy:
                result.append({'ticker': ticker, 'date': ddmmyyyy})
                
        except Exception as e:
            print(f"{ticker}: Error - {e}")
    
    print(f"Result: {result}")
    faltantes = [ticker for ticker in tickers if ticker not in [r['ticker'] for r in result]]
    print(f"Faltantes: {faltantes}")
    
    return jsonify({'results': result, 'faltantes': faltantes})

if __name__ == '__main__':
    app.run(debug=True)