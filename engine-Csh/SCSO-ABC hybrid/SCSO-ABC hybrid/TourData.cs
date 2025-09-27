using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
namespace SCSO_ABC_hybrid
{
    public class TourDataModel
    {
        public List<string> Destinations { get; set; }
        public List<List<double>> CostMatrix { get; set; }
    }

    public class TourData
    {
        public List<string> Destinations { get; private set; }
        public double[,] CostMatrix { get; private set; }
        public int PointCount => Destinations.Count;

        public TourData() { }

        
        public void LoadFromJson(string filePath)
        {
            if (!File.Exists(filePath))
                throw new FileNotFoundException("Không tìm thấy file dữ liệu", filePath);

            var json = File.ReadAllText(filePath);
            var data = JsonConvert.DeserializeObject<TourDataModel>(json);

            if (data == null || data.Destinations == null || data.CostMatrix == null)
                throw new Exception("Dữ liệu JSON không hợp lệ");

            Destinations = data.Destinations;
            int n = data.Destinations.Count;
            CostMatrix = new double[n, n];

            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < n; j++)
                {
                    CostMatrix[i, j] = data.CostMatrix[i][j];
                }
            }
        }

       
        public double CalculateRouteCost(List<int> route)
        {
            double cost = 0;
            for (int i = 0; i < route.Count - 1; i++)
            {
                cost += CostMatrix[route[i], route[i + 1]];
            }
            return cost;
        }

        public List<int> DecodeRandomKey(List<double> randomKey)
        {
            return randomKey
                .Select((val, idx) => new { idx, val })
                .OrderBy(x => x.val)
                .Select(x => x.idx)
                .ToList();
        }

        public void Print()
        {
            Console.WriteLine("Destinations: " + string.Join(", ", Destinations));
            Console.WriteLine("Cost Matrix:");
            int n = Destinations.Count;
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < n; j++)
                {
                    Console.Write(CostMatrix[i, j].ToString("F1") + "\t");
                }
                Console.WriteLine();
            }
        }
    }
}
