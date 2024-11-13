import mongoose from 'mongoose';
import _ from 'lodash';
import express from 'express';

mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost/your-app-name');

