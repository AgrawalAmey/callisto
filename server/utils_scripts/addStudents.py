import argparse
import pandas as pd
import bcrypt
from pymongo import MongoClient

def add_users(args):
    client = MongoClient('mongodb://localhost:27017/')
    users = client.nnfl.users
    df = pd.read_csv(args.csv_path)

    for _, row in df.iterrows():
        user = {
            "username": row['Username'],
            "name": row['Name'],
            "password": bcrypt.hashpw(row[args.password_feild], bcrypt.gensalt(8, prefix=b"2a")),
            "isAdmin": False
        }
        users.insert_one(user)

    client.close()

def update_passwords(args):
    client = MongoClient('mongodb://localhost:27017/')
    users = client.nnfl.users   

    df = pd.read_csv(args.csv_path)

    for _, row in df.iterrows():
        users.update({"username": row['Username']}, 
            {'$set': {"password" : bcrypt.hashpw(row[args.password_feild], bcrypt.gensalt(8, prefix=b"2a"))}})
    
    client.close()


parser = argparse.ArgumentParser(description='Add users and update passwords.')
parser.add_argument('--csv-path', help='csv file path')
parser.add_argument('--password-feild', help='column in csv file which contains password')
parser.add_argument('--method', help='use method add to add users or edit to edit users')

args = parser.parse_args()

if(args.method == 'add'):
    add_users(args)
else:
    update_passwords(args)