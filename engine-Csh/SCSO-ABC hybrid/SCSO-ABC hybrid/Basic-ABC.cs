using System;
using System.Collections.Generic;
using System.Linq;

namespace SCSO_ABC_hybrid
{
    public class BeeColony
    {
        public int Population;
        public int Dimension;
        public int iterC = 1;
        public int iterMax;
        public double Ub;
        public double Lb;

        public Dictionary<int, (List<double> Values, int Trial)> Bee;

        Random rd = new Random();

        public BeeColony(int population, int dimension, int iterMax, double ub, double lb)
        {
            Population = population;
            Dimension = dimension;
            this.iterMax = iterMax;
            Ub = ub;
            Lb = lb;
        }

        private TourData tourData;

        public void SetTourData(TourData data)
        {
            tourData = data;
        }
        public double RandomDouble(double min, double max)
        {
            return min + (max - min) * rd.NextDouble();
        }

        public double BoundBack(double Val)
        {
            if (Val < Lb) return Lb;
            if (Val > Ub) return Ub;
            return Val;
        }

        public double Objective(List<double> x)
        {
            //return x.Sum(v => v * v); --sphere

            // Ackkley
            //int d = x.Count;
            //double sum1 = 0;
            //double sum2 = 0;
            //foreach (var xi in x)
            //{
            //    sum1 += xi * xi;
            //    sum2 += Math.Cos(2 * Math.PI * xi);
            //}
            //return -20 * Math.Exp(-0.2 * Math.Sqrt(sum1 / d))
            //       - Math.Exp(sum2 / d) + 20 + Math.E;

            if (tourData == null)
                throw new Exception("TourData chưa được gán cho BeeColony");

            List<int> route = tourData.DecodeRandomKey(x);

            return tourData.CalculateRouteCost(route);
        }

        public double FitnessFunction(List<double> list)
        {
            double of = Objective(list);
            return of > 0 ? 1 / (1 + of) : 1 + Math.Abs(of);
        }

        public void Initial_Population()
        {
            Bee = new Dictionary<int, (List<double>, int)>();
            for (int i = 0; i < Population; i++)
            {
                var values = new List<double>();
                for (int j = 0; j < Dimension; j++)
                {
                    values.Add(RandomDouble(Lb, Ub));
                }
                Bee[i] = (values, 0);
            }
        }

        public void PrintPopulation(int iterC)
        {
            Console.Write($"Iter {iterC}: ");
            foreach (var kvp in Bee)
            {
                var beeInfo = kvp.Value;
                Console.WriteLine("[" + string.Join(", ", beeInfo.Values.Select(v => v.ToString("F2"))) + $"] T={beeInfo.Trial};  ");
            }
            Console.WriteLine();
        }

        public List<double> NewX(int selfKey)
        {
            var otherKeys = Bee.Keys.Where(k => k != selfKey).ToList();
            int partnerKey = otherKeys[rd.Next(otherKeys.Count)];
            List<double> list1 = Bee[selfKey].Values;
            List<double> list2 = Bee[partnerKey].Values;
            double phi = RandomDouble(-1, 1);
            return list1.Zip(list2, (a, b) => BoundBack(a + phi * (a - b))).ToList();
        }

        public void GreedySelection(int key, List<double> oldX, List<double> newX)
        {
            if (Objective(newX) < Objective(oldX))
            {
                Bee[key] = (newX, 0);
            }
            else
            {
                var current = Bee[key];
                Bee[key] = (current.Values, current.Trial + 1);
            }
        }

        public double Probability(int key)
        {
            double invFit(int idx) => 1.0 / (1.0 + Objective(Bee[idx].Values));
            double sum = Bee.Keys.Sum(invFit);
            if (sum == 0) return 1.0 / Bee.Count;
            return invFit(key) / sum;
        }

        public List<double> GetBestBeeValues()
        {
            var best = Bee.Values.First();
            double bestFitness = Objective(best.Values);
            foreach (var b in Bee.Values)
            {
                double fitness = Objective(b.Values);
                if (fitness < bestFitness)
                {
                    best = b;
                    bestFitness = fitness;
                }
            }
            return best.Values;
        }

        public void SaveBestFitnessPerIteration(List<double> BestHistory)
        {
            var best = Bee.Values.First();
            double bestFitness = Objective(best.Values);
            foreach (var b in Bee.Values)
            {
                double fitness = Objective(b.Values);
                if (fitness < bestFitness)
                {
                    best = b;
                    bestFitness = fitness;
                }
            }
            BestHistory.Add(bestFitness);
        }

        public void RunABC()
        {
            Initial_Population();
            List<double> BestHistory = new List<double>();

            for (iterC = 1; iterC <= iterMax; iterC++)
            {
                foreach (var key in Bee.Keys.ToList())
                {
                    var oldX = Bee[key].Values;
                    var newXVals = NewX(key);
                    GreedySelection(key, oldX, newXVals);
                }

                int n = 0;
                while (n < Bee.Count)
                {
                    foreach (var key in Bee.Keys.ToList())
                    {
                        double prob = Probability(key);
                        if (rd.NextDouble() < prob)
                        {
                            var oldX = Bee[key].Values;
                            var newXVals = NewX(key);
                            GreedySelection(key, oldX, newXVals);
                            n++;
                            if (n >= Bee.Count) break;
                        }
                    }
                }

                int bestIndex = Bee.OrderBy(kvp => Objective(kvp.Value.Values))
                                   .First().Key;

                var candidates = Bee.Where(kvp => kvp.Key != bestIndex
                                               && kvp.Value.Trial > Dimension)
                                    .ToList();

                if (candidates.Count > 0)
                {
                    int maxTrial = candidates.Max(c => c.Value.Trial);
                    var topTrials = candidates.Where(c => c.Value.Trial == maxTrial)
                                              .Select(c => c.Key)
                                              .ToList();
                    int chosenKey = topTrials[rd.Next(topTrials.Count)];

                    var newVals = new List<double>();
                    for (int j = 0; j < Dimension; j++)
                        newVals.Add(RandomDouble(Lb, Ub));

                    Bee[chosenKey] = (newVals, 0);
                }


                SaveBestFitnessPerIteration(BestHistory);
                PrintPopulation(iterC);
            }

            var best = GetBestBeeValues();
            Console.WriteLine("Best solution: " + string.Join(", ", best));
            Console.WriteLine("Best objective: " + Objective(best));
        }
    }
}
