import pandas as pd
import numpy as np
from typing import List, Optional

def is_numeric_column(df: pd.DataFrame, col: str) -> bool:
    """Check if a column is numeric or can be safely treated as numeric."""
    if col not in df.columns:
        return False
    series = df[col]
    if pd.api.types.is_numeric_dtype(series):
        # Exclude boolean
        if pd.api.types.is_bool_dtype(series):
            return False
        return True
    # If object or string dtype, check if values can convert to numeric
    valid = series.dropna()
    if len(valid) == 0:
        return False
    sample = valid.head(50)
    converted = pd.to_numeric(sample, errors='coerce')
    # If at least 70% convert successfully and nunique > 1
    return converted.notna().sum() >= len(sample) * 0.7

def find_numeric_column(df: pd.DataFrame, preferred_terms: Optional[List[str]] = None) -> Optional[str]:
    """Find the best numeric column matching preferred terms or fallback to the first numeric column."""
    numeric_cols = [c for c in df.columns if is_numeric_column(df, c)]
    if not numeric_cols:
        return None

    if preferred_terms:
        # Avoid columns with non-metric keywords (e.g. ID, code, date)
        penalty_words = {"id", "code", "zip", "phone", "year", "date", "rep", "channel", "category", "type"}

        # 1. Exact match (case-insensitive)
        for term in preferred_terms:
            t_low = term.lower()
            for c in numeric_cols:
                if c.lower() == t_low:
                    return c

        # 2. Preferred term inside column name without penalty
        for term in preferred_terms:
            t_low = term.lower()
            for c in numeric_cols:
                c_low = c.lower()
                if t_low in c_low and not any(p in c_low for p in penalty_words):
                    return c

        # 3. Any preferred term inside column name
        for term in preferred_terms:
            t_low = term.lower()
            for c in numeric_cols:
                if t_low in c.lower():
                    return c

    # Fallback: prefer columns without penalty words
    for c in numeric_cols:
        c_low = c.lower()
        if not any(p in c_low for p in ["id", "code", "zip"]):
            return c

    return numeric_cols[0]

def find_categorical_column(df: pd.DataFrame, preferred_terms: Optional[List[str]] = None) -> Optional[str]:
    """Find a categorical / text column matching preferred terms."""
    # Columns that are object/category or low distinct numeric
    cat_cols = [
        c for c in df.columns
        if not pd.api.types.is_numeric_dtype(df[c]) or df[c].nunique() <= 30
    ]
    if not cat_cols:
        return None

    if preferred_terms:
        # 1. Exact match
        for term in preferred_terms:
            t_low = term.lower()
            for c in cat_cols:
                if c.lower() == t_low:
                    return c

        # 2. Substring match
        for term in preferred_terms:
            t_low = term.lower()
            for c in cat_cols:
                if t_low in c.lower():
                    return c

    return cat_cols[0]

def find_date_column(df: pd.DataFrame) -> Optional[str]:
    """Find a date / datetime / time column."""
    for c in df.columns:
        c_low = c.lower()
        if any(w in c_low for w in ["date", "time", "timestamp", "month", "created_at", "day"]):
            return c
        if pd.api.types.is_datetime64_any_dtype(df[c]):
            return c
    return None
