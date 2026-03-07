import { isValidObjectId } from 'mongoose';
import { Make, type MakeDoc } from '../models/Make';
import { CarModel, type CarModelDoc } from '../models/CarModel';
import { ApiError } from '../utils/ApiError';

export interface MakeDTO {
  id: string;
  name: string;
  slug: string;
}

export interface ModelDTO {
  id: string;
  makeId: string;
  name: string;
  slug: string;
}

function toMakeDTO(doc: MakeDoc): MakeDTO {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug
  };
}

function toModelDTO(doc: CarModelDoc): ModelDTO {
  return {
    id: doc.id,
    makeId: doc.make.toString(),
    name: doc.name,
    slug: doc.slug
  };
}

export async function listMakes(): Promise<MakeDTO[]> {
  const makes = await Make.find().sort({ name: 1 });
  return makes.map(toMakeDTO);
}

export async function listModelsByMake(makeId: string): Promise<ModelDTO[]> {
  if (!isValidObjectId(makeId)) {
    throw ApiError.badRequest('Invalid make id');
  }

  const models = await CarModel.find({ make: makeId }).sort({ name: 1 });
  return models.map(toModelDTO);
}

