using System;
using System.Collections.Generic;
using System.Linq;

namespace SCSO_ABC_hybrid
{
    public class SandCatSwarm
    {
        public int Population;
        public int Dimension;
        public int iterC = 1;
        public int iterMax;
        public double Ub;
        public double Lb;

        public Dictionary<int, List<double>> SandCat = new Dictionary<int, List<double>>();
        static int SM = 2;
        Random rd = new Random();

        public SandCatSwarm(int population, int dimension, int itermax, double ub, double lb)
        {
            Population = population;
            Dimension = dimension;
            iterMax = itermax;
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
            // sphere
            //return x.Sum(v => v * v);

            // Ackley
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
                throw new Exception("TourData chưa được gán cho SandCatSwarm");

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
            SandCat.Clear();
            for (int i = 0; i < Population; i++)
            {
                var pos = new List<double>();
                for (int j = 0; j < Dimension; j++)
                {
                    pos.Add(RandomDouble(Lb, Ub));
                }
                SandCat[i] = pos;
            }
        }

        public double Equation_1()
        {
            return SM - ((SM * (double)iterC) / (double)iterMax);
        }

        public double Equation_2()
        {
            return 2 * Equation_1() * rd.NextDouble() - Equation_1();
        }

        public double Equation_3()
        {
            return Equation_1() * rd.NextDouble();
        }

        public double Equation_4(double Pos_b, double Pos_c)
        {
            return BoundBack(Equation_3() * (Pos_b - rd.NextDouble() * Pos_c));
        }

        double Equation_5_1(double Pos_b, double Pos_c)
        {
            return Math.Abs((rd.NextDouble() * Pos_b - Pos_c));
        }

        public double Equation_5_2(double Pos_b, double Pos_c)
        {
            return BoundBack(Pos_b - Equation_3() * Equation_5_1(Pos_b, Pos_c) * Math.Cos(RandomDouble(0, Math.PI * 2)));
        }

        public int BestIndex()
        {
            var values = SandCat.Select(kv => Objective(kv.Value)).ToList();
            double minv = values.Min();
            return values.IndexOf(minv);
        }

        public List<double> BestValues()
        {
            int idx = BestIndex();
            return SandCat[idx];
        }

        public List<double> UpdateWithEq5(List<double> t, List<double> Best)
        {
            return t.Zip(Best, (a, b) => Equation_5_2(b, a)).ToList();
        }

        public List<double> UpdateWithEq4(List<double> t, List<double> Best)
        {
            return t.Zip(Best, (a, b) => Equation_4(b, a)).ToList();
        }

        public void SaveBestFitnessPerIteration(List<double> BestHistory)
        {
            var bestVal = SandCat.Select(cat => Objective(cat.Value)).Min();
            BestHistory.Add(bestVal);
        }
    }
}
