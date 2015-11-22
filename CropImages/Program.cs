using System.Drawing;
using System.IO;
using System.Linq;

namespace CropImages {
	class Program {
		private const string rootDirectory = @"C:\Users\Anton Selutin\Downloads\gif";

		static void Main(string[] args) {
			Rectangle cropRect = new Rectangle(291, 196, 672, 645);
			string croppedDirectory = Path.Combine(rootDirectory, "jpeg");
			Directory.CreateDirectory(croppedDirectory);

			foreach (var file in new DirectoryInfo(rootDirectory).EnumerateFiles("*.png")) {
				using (Bitmap src = Image.FromFile(file.FullName) as Bitmap) {
					using (Bitmap target = new Bitmap(cropRect.Width, cropRect.Height)) {
						using (Graphics g = Graphics.FromImage(target)) {
							g.DrawImage(src, new Rectangle(0, 0, target.Width, target.Height), cropRect, GraphicsUnit.Pixel);
							target.Save(Path.Combine(croppedDirectory, file.Name), System.Drawing.Imaging.ImageFormat.Jpeg);
                        }
					}
				}
			}
		}
	}
}
