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

def dividend_dates(ticker_symbol):
    stock = yf.Ticker(ticker_symbol)
    calendar = stock.calendar

    # print(f"Calendar for {ticker_symbol}: {calendar}")
    
    if "Ex-Dividend Date" in calendar:
        ex_div_date = calendar["Ex-Dividend Date"]
        if "Dividend Date" in calendar:
            pay_date = calendar["Dividend Date"]
            ex_div_date_str = ex_div_date.strftime("%Y-%m-%d") if ex_div_date else None
            pay_date_str = pay_date.strftime("%Y-%m-%d") if pay_date else None
            return ex_div_date_str, pay_date_str
        else:
            return ex_div_date.strftime("%Y-%m-%d"), None
    else:
        return None, None

@app.route('/api/dividends')
def dividends():
    """
    Reads dividends_stocks.csv and returns:
    {
      'results': [ { ticker, ex_date, pay_date } ],
      'faltantes': [ ... ]
    }
    """
    result = []
    missing = []

    try:
        with open('../dividends_stocks.csv', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                ticker = row['ticker'].strip().upper()
                try:
                    ex_date, pay_date = dividend_dates(ticker)
                    if ex_date is None:
                        missing.append(ticker)
                        continue

                    result.append({
                        'ticker': ticker,
                        'ex_date': ex_date,
                        'pay_date': pay_date
                    })
                except Exception as e:
                    print(f"Error fetching dividend for {ticker}: {e}")
                    missing.append(ticker)
    except FileNotFoundError:
        print("dividends_stocks.csv file not found")

    return jsonify({'results': result, 'faltantes': missing})

if __name__ == '__main__':
    app.run(debug=True)